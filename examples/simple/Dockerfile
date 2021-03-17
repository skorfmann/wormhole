FROM public.ecr.aws/lambda/nodejs:12
# Alternatively, you can pull the base image from Docker Hub: amazon/aws-lambda-nodejs:12

# Install NPM dependencies for function
COPY package.json /var/task/package.json
COPY package-lock.json /var/task/package-lock.json
RUN npm install

COPY . /var/task/

RUN mv jest.config.js.lambda jest.config.js

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "runner.handler" ]