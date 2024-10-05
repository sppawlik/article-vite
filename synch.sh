
aws s3 sync ./dist s3://newsletter-frontend-058264487634-eu-central-1
aws cloudfront create-invalidation --distribution-id E3MR4QMAKAR8LO --paths /index.html