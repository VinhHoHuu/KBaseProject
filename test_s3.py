import boto3
from botocore.client import Config

s3 = boto3.client(
    "s3",
    endpoint_url="https://uvjvbsytbdfyacoopwod.storage.supabase.co/storage/v1/s3",
    aws_access_key_id="74c736b0b53280168f68b407586959b9",
    aws_secret_access_key="67381040889a581bec397b87470a681ca11442174f22304cf30eecd10a5940c1",
    region_name="ap-southeast-1"
)

try:
    s3.put_object(
        Bucket="kbase-files",
        Key="test-python.txt",
        Body=b"Hello from Python",
        ContentType="text/plain"
    )
    print("SUCCESS")
except Exception as e:
    print("ERROR:", e)
