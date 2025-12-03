import requests

RAPIDAPI_HOST = "plant-hardiness-zone.p.rapidapi.com"
RAPIDAPI_URL = "https://plant-hardiness-zone.p.rapidapi.com/zipcodes/{}"

RAPIDAPI_KEY = "4c2b70bb0emsh5b915260f4c20d8p179699jsnf4f4fba83f84"

def get_zone_from_zip(zipcode):
    print("Calling zone API with ZIP", zipcode)

    url = RAPIDAPI_URL.format(zipcode)

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            print("Zone API Error:", response.status_code, response.text)
            return None
        
        data = response.json()

        # return data 
        # {
        #       "hardiness_zone": "10b",
        #       "zipcode": "72201"
        # }
        return data.get("hardiness_zone")

    except requests.exceptions.RequestException as e:
        print("Zone API request failed", e)
        return None