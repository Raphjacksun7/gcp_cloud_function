#!/bin/sh

PROJECT_ID="examen-cloud-function-raphael"
BUCKET_NAME="exercicee" 
NEW_USER_EMAIL="softconceptcanada@gmail.com"

# Create custom role
gcloud iam roles create custom_storage_read_write \
    --project=$PROJECT_ID \
    --title="Custom Storage Read/Write" \
    --description="Read and write access to storage objects" \
    --permissions=storage.objects.get,storage.objects.list,storage.objects.create,storage.objects.update

# Assign the custom role to the user on the bucket
gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
    --member="user:$NEW_USER_EMAIL" \
    --role="projects/$PROJECT_ID/roles/custom_storage_read_write"