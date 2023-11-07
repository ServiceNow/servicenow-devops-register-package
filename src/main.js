const core = require('@actions/core');
const axios = require('axios');

function circularSafeStringify(obj) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
}

(async function main() {
    let instanceUrl = core.getInput('instance-url', { required: true });
    const toolId = core.getInput('tool-id', { required: true });
    const username = core.getInput('devops-integration-user-name', { required: false });
    const password = core.getInput('devops-integration-user-password', { required: false });
    const packagename = core.getInput('package-name', { required: true });
    const jobname = core.getInput('job-name', { required: true });
    const devopsIntegrationToken = core.getInput('devops-integration-token', { required: false });
    let artifacts = core.getInput('artifacts', { required: true });
    
    try {
        artifacts = JSON.parse(artifacts);
    } catch (e) {
        core.setFailed(`Failed parsing artifacts ${e}`);
        return;
    }

    let githubContext = core.getInput('context-github', { required: true });

    try {
        githubContext = JSON.parse(githubContext);
    } catch (e) {
        core.setFailed(`Exception parsing github context ${e}`);
    }

    let payload;
   
    try {
        instanceUrl = instanceUrl.trim();
        if (instanceUrl.endsWith('/'))
            instanceUrl = instanceUrl.slice(0, -1);

        payload = {
            'name': packagename,
            'artifacts': artifacts,
            'pipelineName': `${githubContext.repository}/${githubContext.workflow}`,
            'stageName': jobname,
            'taskExecutionNumber': `${githubContext.run_id}` + '/attempts/' + `${githubContext.run_attempt}`,
            'branchName': `${githubContext.ref_name}`
        };
        console.log("paylaod to register package: " + JSON.stringify(payload));
    } catch (e) {
        core.setFailed(`Exception setting the payload to register package ${e}`);
        return;
    }
    try {
        let snowResponse;
        const endpointv1 = `${instanceUrl}/api/sn_devops/v1/devops/package/registration?orchestrationToolId=${toolId}`;
        const endpointv2 = `${instanceUrl}/api/sn_devops/v2/devops/package/registration?orchestrationToolId=${toolId}`;
        let endpoint ;
        let httpHeaders ;
        if(!devopsIntegrationToken && !username && !password){
            core.setFailed('Either secret token or integration username, password is needed for integration user authentication');
            return;
        } else if(devopsIntegrationToken){
            const defaultHeadersv2 = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'sn_devops.DevOpsToken '+`${toolId}`+':'+`${devopsIntegrationToken}`
            };
            httpHeaders = { headers: defaultHeadersv2 };
            endpoint = endpointv2;
        }else if(username && password){
            const token = `${username}:${password}`;
            const encodedToken = Buffer.from(token).toString('base64');
            const defaultHeadersv1 = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Basic ' + `${encodedToken}`
            };
            httpHeaders = { headers: defaultHeadersv1 };
            endpoint = endpointv1;
        }else{
            core.setFailed('For Basic Auth, Username and Password is mandatory for integration user authentication');
            return;
        }
        snowResponse = await axios.post(endpoint, JSON.stringify(payload), httpHeaders);
    } catch (e) {
        core.debug('[ServiceNow DevOps] Package Registration, Error: '+JSON.stringify(e));
        if (e.message.includes('ECONNREFUSED') || e.message.includes('ENOTFOUND') || e.message.includes('405')) {
            core.setFailed('ServiceNow Instance URL is NOT valid. Please correct the URL and try again.');
        } else if (e.message.includes('401')) {
            core.setFailed('Invalid username and password or Invalid token and toolid. Please correct the input parameters and try again.');
            if(e.response && e.response.data) 
            {
                var responseObject=circularSafeStringify(e.response.data);
                core.debug('[ServiceNow DevOps] Package Registration, Response data :'+responseObject);          
            }
        } else if(e.message.includes('400') || e.message.includes('404')){
            let errMsg = '[ServiceNow DevOps] Package Registration is not Successful. ';
            let errMsgSuffix = ' Please provide valid inputs.';
            let responseData = e.response.data;
            if (responseData && responseData.result && responseData.result.errorMessage) {
                errMsg = errMsg + responseData.result.errorMessage + errMsgSuffix;
                core.setFailed(errMsg);
            }
            else if (responseData && responseData.result && responseData.result.details && responseData.result.details.errors) {
                let errors = responseData.result.details.errors;
                for (var index in errors) {
                    errMsg = errMsg + errors[index].message + errMsgSuffix;
                }
                core.setFailed(errMsg);
            }
        } else {
            core.setFailed('ServiceNow Package is NOT created. Please check ServiceNow logs for more details.');
        }
    }
    
})();