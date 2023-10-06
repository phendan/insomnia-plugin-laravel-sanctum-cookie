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

            console.log('Sent CSRF cookie request')

            if (response.error) {
                throw new Error(`Failed to send dependent request - ${response.error}`)
            }

            const cookie = response.headers.find(it => {
                return it.name === 'Set-Cookie' && it.value.includes(cookieName)
            })

            if (typeof cookie === 'undefined') {
                throw new Error(`Could not find "${cookieName}" in cookies`)
            }

            const pattern = new RegExp(`(?<=${cookieName}=)[^;]+`, 'g')
            const token = cookie.value.match(pattern)[0]

            return decodeURIComponent(token)
        }
    }
]

module.exports.requestHooks = [
    //
]
