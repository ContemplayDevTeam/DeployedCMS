# Test Airtable API - getUserByEmail
# Updated with actual credentials
$AIRTABLE_API_KEY = "patqiztxHCH8YgiMR.7783be7343140f6db8abc92bc729c3c6e76106cee56dab28b2963fb4769fa68c"
$AIRTABLE_BASE_ID = "appS4ZTtBg4oTHLUz"
$EMAIL = "bvryn@umich.edu"

# URL encode the filter formula manually
$FILTER_FORMULA = "{Email} = '$EMAIL'"
$ENCODED_FILTER = $FILTER_FORMULA -replace ' ', '%20' -replace '{', '%7B' -replace '}', '%7D' -replace "'", '%27' -replace '=', '%3D'

# Construct the URL
$URL = "https://api.airtable.com/v0/$AIRTABLE_BASE_ID/Users?filterByFormula=$ENCODED_FILTER"

Write-Host "Testing Airtable API..."
Write-Host "URL: $URL"
Write-Host "Email: $EMAIL"
Write-Host ""

# Make the API request
try {
    $headers = @{
        "Authorization" = "Bearer $AIRTABLE_API_KEY"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri $URL -Headers $headers -Method Get
    Write-Host "Success! Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "HTTP Status: $statusCode"
    }
}

Write-Host ""
Write-Host "Test completed!" 