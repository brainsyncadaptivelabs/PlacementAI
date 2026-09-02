$body = @{
    email = "founders.brainsynclabs@gmail.com"
    password = "admin123"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/auth/login" -Method Post -Body $body -ContentType "application/json"
Write-Host "LOGIN RESPONSE:" ($login | ConvertTo-Json)

$headers = @{
    Authorization = "Bearer " + $login.token
}

$endpoints = @("/dashboard", "/credits", "/api-usage", "/resumes", "/interviews", "/system-health", "/users", "/announcements", "/feature-flags", "/coupons")

foreach ($ep in $endpoints) {
    try {
        $res = Invoke-WebRequest -Uri ("http://localhost:8080/api/v1/admin" + $ep) -Headers $headers -Method Get
        Write-Host "$ep => Status: $($res.StatusCode)"
    } catch {
        Write-Host "$ep => Exception: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $respBody = $reader.ReadToEnd()
            Write-Host "$ep => Response Body: $respBody"
        }
    }
}
