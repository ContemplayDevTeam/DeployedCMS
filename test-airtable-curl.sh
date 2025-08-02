#!/bin/bash

# Test Airtable API - getUserByEmail
# Updated with actual credentials
AIRTABLE_API_KEY="patqiztxHCH8YgiMR.7783be7343140f6db8abc92bc729c3c6e76106cee56dab28b2963fb4769fa68c"
AIRTABLE_BASE_ID="appS4ZTtBg4oTHLUz"
EMAIL="bvryn@umich.edu"

# URL encode the filter formula
FILTER_FORMULA="{Email} = '$EMAIL'"
ENCODED_FILTER=$(echo "$FILTER_FORMULA" | sed 's/ /%20/g' | sed 's/{/%7B/g' | sed 's/}/%7D/g' | sed "s/'/%27/g" | sed 's/=/%3D/g')

# Construct the URL
URL="https://api.airtable.com/v0/$AIRTABLE_BASE_ID/Users?filterByFormula=$ENCODED_FILTER"

echo "Testing Airtable API..."
echo "URL: $URL"
echo "Email: $EMAIL"
echo ""

# Make the API request
curl -X GET "$URL" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "Test completed!" 