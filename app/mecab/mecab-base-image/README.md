*** This process is independently implemented from CDK project and CICD pipelines
## 1. Build docker image
- Build image from Dockerfile
```shell
docker build . -t mecab-base-image:latest
```
## 2. Create ECR repository
- Create ECR repository with AWS CLI
```shell
aws ecr create-repository --repository-name mecab-base-image
```
(response)
```json
{
    "repository": {
        "repositoryArn": "arn:aws:ecr:ap-northeast-1:588907989152:repository/mecab-base-image",
        "registryId": "588907989152",
        "repositoryName": "mecab-base-image",
        "repositoryUri": "588907989152.dkr.ecr.ap-northeast-1.amazonaws.com/mecab-base-image",
        "createdAt": "2025-02-21T17:33:45.474000+09:00",
        "imageTagMutability": "MUTABLE",
        "imageScanningConfiguration": {
            "scanOnPush": false
        },
        "encryptionConfiguration": {
            "encryptionType": "AES256"
        }
    }
}
```
- Record URI of created ECR repository
>588907989152.dkr.ecr.ap-northeast-1.amazonaws.com/mecab-base-image

## 3. Push image to ECR repository
- ECR Private Registry Authentication
```shell
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 588907989152.dkr.ecr.ap-northeast-1.amazonaws.com
```
```shell
WARNING! Your password will be stored unencrypted in /home/admin/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```
- Create docker tag with ECR repository name
```shell
docker tag mecab-base-image:latest 588907989152.dkr.ecr.ap-northeast-1.amazonaws.com/mecab-base-image:latest
```

- Push image to ECR repository
```shell
docker push 588907989152.dkr.ecr.ap-northeast-1.amazonaws.com/mecab-base-image:latest
```