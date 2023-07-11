import boto3

pattern = "iotstack"
client = boto3.client('s3')
response = client.list_buckets()
bucket_list = response['Buckets']

for bucket in bucket_list:
    if pattern in bucket['Name']:
        print(bucket['Name'])
        s3 = boto3.resource('s3')
        s3_bucket = s3.Bucket(bucket['Name'])
        bucket_versioning = s3.BucketVersioning(bucket['Name'])
        print("bucket versioning is...")
        print(bucket_versioning.status)
        if bucket_versioning.status == 'Enabled':
            print("Deleting bucket versions")
            s3_bucket.object_versions.delete()
            print("Bucket versions deleted")
        s3_bucket.objects.all().delete()
        print(f"deleted {s3_bucket}!")
        response = client.delete_bucket(Bucket=bucket['Name'])
    else:
        print("That bucket doesn't include the pattern")