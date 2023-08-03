# ServiceNow DevOps Register Package GitHub Action

This custom action needs to be added at step level in a job to register package details in ServiceNow instance.

# Usage
## Step 1: Prepare values for setting up your secrets for Actions
- credentials (Devops integration token of a GitHub tool created in ServiceNow DevOps or username and password for a ServiceNow devops integration user)
- instance URL for your ServiceNow dev, test, prod, etc. environments
- tool_id of your GitHub tool created in ServiceNow DevOps

## Step 2: Configure Secrets in your GitHub Ogranization or GitHub repository
On GitHub, go in your organization settings or repository settings, click on the _Secrets > Actions_ and create a new secret.

For token based authentication which is available from @v2.0.0 , create secrets called 
- `SN_INSTANCE_URL` your ServiceNow instance URL, for example **https://test.service-now.com**
- `SN_ORCHESTRATION_TOOL_ID` only the **sys_id** is required for the GitHub tool created in your ServiceNow instance
- `SN_DEVOPS_INTEGRATION_TOKEN` required for token based authentication

For basic authentication , create secrets called 
- `SN_INSTANCE_URL` your ServiceNow instance URL, for example **https://test.service-now.com**
- `SN_ORCHESTRATION_TOOL_ID` only the **sys_id** is required for the GitHub tool created in your ServiceNow instance
- `SN_DEVOPS_USER`
- `SN_DEVOPS_PASSWORD`

## Step 3: Configure the GitHub Action if need to adapt for your needs or workflows
## For Token based Authentication which is available from @v2.0.0 , at ServiceNow instance
```yaml
registerpackage:
    name: Register Package
    runs-on: ubuntu-latest
    steps:
      - name: ServiceNow Register Package
        uses: ServiceNow/servicenow-devops-register-package@v2.0.0
        with:
          devops-integration-token: ${{ secrets.SN_DEVOPS_INTEGRATION_TOKEN }}
          instance-url: ${{ secrets.SN_INSTANCE_URL }}
          tool-id: ${{ secrets.SN_ORCHESTRATION_TOOL_ID }}
          context-github: ${{ toJSON(github) }}
          job-name: 'Register Package'
          artifacts: '[{"name": "com:customactiondemo","version": "1.${{ github.run_number }}","semanticVersion": "1.${{ github.run_number }}.0","repositoryName": "${{ github.repository }}"}]'
          package-name: 'registerpackage.war'
```
## For Basic Authentication at ServiceNow instance
```yaml
registerpackage:
    name: Register Package
    runs-on: ubuntu-latest
    steps:
      - name: ServiceNow Register Package
        uses: ServiceNow/servicenow-devops-register-package@v2.0.0
        with:
          devops-integration-user-name: ${{ secrets.SN_DEVOPS_USER }}
          devops-integration-user-passwd: ${{ secrets.SN_DEVOPS_PASSWORD }}
          instance-url: ${{ secrets.SN_INSTANCE_URL }}
          tool-id: ${{ secrets.SN_ORCHESTRATION_TOOL_ID }}
          context-github: ${{ toJSON(github) }}
          job-name: 'Register Package'
          artifacts: '[{"name": "com:customactiondemo","version": "1.${{ github.run_number }}","semanticVersion": "1.${{ github.run_number }}.0","repositoryName": "${{ github.repository }}"}]'
          package-name: 'registerpackage.war'
```
The values for secrets should be setup in Step 1. Secrets should be created in Step 2.

## Inputs

### `devops-integration-user-name`

**Optional**  DevOps Integration Username to ServiceNow instance for basic authentication. 

### `devops-integration-user-password`

**Optional**  DevOps Integration User Password to ServiceNow instance for basic authentication. 

### `devops-integration-token`

**Optional**  DevOps Integration Token of GitHub tool created in ServiceNow instance for token based authentication. 

### `instance-url`

**Required**  URL of ServiceNow instance to register package details. 

### `tool-id`

**Required**  Orchestration Tool Id for GitHub created in ServiceNow DevOps

### `context-github`

**Required**  Github context contains information about the workflow run details.

### `job-name`

**Required**  Display name of the job given for attribute _name_ in which _steps_ have been added for this custom action. For example, if display name of job is _Register Package_ then job-name value must be _'Register Package'_

### `artifacts`

**Required**  The list of artifacts to be registered in ServiceNow instance. Each artifact is a JSON object surrounded by curly braces _{}_ containing key-value pair separated by a comma _,_. A key-value pair consists of a key and a value separated by a colon _:_. The keys supported in key-value pair are _name_, _version_, _semanticVersion_, _repositoryName_ key-value pair separated by comma surrounded by curly braces {}. For example, '[{"name": "com:firstrepo","version": "1.${{ github.run_number }}","semanticVersion": "1.${{ github.run_number }}.0","repositoryName": "${{ github.repository }}"}]'

### `package-name`

**Required**  Name of the package that contains artifacts.

## Outputs
No outputs produced.

# Notices

## Support Model

ServiceNow customers may request support through the [Now Support (HI) portal](https://support.servicenow.com/nav_to.do?uri=%2Fnow_support_home.do).

## Governance Model

Initially, ServiceNow product management and engineering representatives will own governance of these integrations to ensure consistency with roadmap direction. In the longer term, we hope that contributors from customers and our community developers will help to guide prioritization and maintenance of these integrations. At that point, this governance model can be updated to reflect a broader pool of contributors and maintainers. 
