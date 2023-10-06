// For help writing plugins, visit the documentation to get started:
//   https://docs.insomnia.rest/insomnia/introduction-to-plugins

module.exports.templateTags = [
    {
        name: 'laravel_csrf_cookie',
        displayName: 'Laravel Sanctum Cookie',
        description: 'Retrieve the CSRF Cookie from Laravel Sanctum',
        args: [
            {
                displayName: 'Sanctum Cookie Request',
                type: 'model',
                model: 'Request'
            },
            {
                displayName: 'Sanctum Cookie Name',
                type: 'string',
                defaultValue: 'XSRF-TOKEN',
                placeholder: 'Laravel uses "XSRF-TOKEN" by default.'
            }
        ],
        async run(context, requestId, cookieName = 'XSRF-TOKEN') {
            if (requestId === 'n/a') throw new Error(`Please select a request`)

            const request = await context.util.models.request.getById(requestId)
            const response = await context.network.sendRequest(request)

            if (response.error) {
                throw new Error('Failed to send dependent request ' + response.error)
            }

            const cookie = response.headers.find(
                it => it.name === 'Set-Cookie' && it.value.includes(cookieName)
            )

            const pattern = new RegExp(`(?<=${cookieName}=)[^;]+`, 'g')
            const token = cookie?.value.match(pattern)[0]
            // console.log('token', token)

            // const token = cookie?.value
            //     .split('; ')
            //     .find(it => it.startsWith(`${cookieName}=`))
            //     ?.split('=')
            //     .at(1)

            // console.log('token', token)

            // const cookieJar = await this.getCookieJar(context)
            // const token = cookieJar.cookies?.find(cookie => cookie.key === cookieName)

            if (typeof token === 'undefined') {
                throw new Error(`Could not find "${cookieName}" in cookies`)
            }

            console.log('ran csrf cookie request')

            return decodeURIComponent(token)
        },

        async getCookieJar(context) {
            const { meta } = context

            if (!meta.requestId || !meta.workspaceId) {
                throw new Error(`Request ID or workspace ID not found`)
            }

            const workspace = await context.util.models.workspace.getById(
                meta.workspaceId
            )

            if (!workspace) {
                throw new Error(`Workspace not found for ${meta.workspaceId}`)
            }

            const cookieJar =
                await context.util.models.cookieJar.getOrCreateForWorkspace(workspace)

            if (!cookieJar) {
                throw new Error(`Cookie jar not found for ${meta.workspaceId}`)
            }

            return cookieJar
        }
    }
]

module.exports.requestHooks = [
    //
]
