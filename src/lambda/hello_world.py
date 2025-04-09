import site
import re
import os
import urllib
import requests

def lambda_handler(event, context):
    print("MECAB_API_URL:", os.environ.get('MECAB_API_URL'))
    res = generate_mecab_api_url_node(event['address'])
    print("RES: ", res)
    return {
        'statusCode': 200,
        'body': 'Hello, World!'
    } 

def generate_mecab_api_url_node(text):  
    encoded_address = urllib.parse.quote(text)
    mecab_api_url = os.environ['MECAB_API_URL']
    node = requests.get(mecab_api_url + encoded_address).json() 
    return node