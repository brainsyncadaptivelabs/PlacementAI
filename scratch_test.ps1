$body = '{"email":"founders.brainsynclabs@gmail.com","password":"admin123"}'
$loginJson = curl.exe -s -X POST "http://localhost:8080/api/v1/admin/auth/login" -H "Content-Type: application/json" -d $body
Write-Output "LOGIN RESPONSE: $loginJson"

$token = ($loginJson | ConvertFrom-Json).token

$endpoints = @("/dashboard", "/credits", "/api-usage", "/resumes", "/interviews", "/system-health", "/users", "/announcements", "/feature-flags", "/coupons")

foreach ($ep in $endpoints) {
    $url = "http://localhost:8080/api/v1/admin" + $ep
    $code = curl.exe -s -o nul -w "%{http_code}" -H "Authorization: Bearer $token" $url
    Write-Output "ENDPOINT $ep => HTTP $code"
}
