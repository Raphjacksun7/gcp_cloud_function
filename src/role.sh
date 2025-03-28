#!/bin/sh

PROJECT_ID="examen-cloud-function-raphael"
BUCKET_NAME="exercicee" 
NEW_USER_EMAIL="softconceptcanada@gmail.com"

# Set the active GCP project
gcloud config set project $PROJECT_ID

# Grant Project Viewer role (to access the GCP console)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$NEW_USER_EMAIL" \
    --role="roles/viewer"

# Create custom Storage role (read/write objects)
gcloud iam roles create custom_storage_read_write \
    --project=$PROJECT_ID \
    --title="Custom Storage Read/Write" \
    --description="Read and write access to storage objects" \
    --permissions=storage.objects.get,storage.objects.list,storage.objects.create,storage.objects.update

# Assign custom role to the user on the bucket
gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
    --member="user:$NEW_USER_EMAIL" \
    --role="projects/$PROJECT_ID/roles/custom_storage_read_write"

# Grant Cloud Functions Developer role
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$NEW_USER_EMAIL" \
    --role="roles/cloudfunctions.developer"

# Grant Cloud Run Developer role
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$NEW_USER_EMAIL" \
    --role="roles/run.developer"