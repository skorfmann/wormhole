FROM public.ecr.aws/lambda/nodejs:12
# Alternatively, you can pull the base image from Docker Hub: amazon/aws-lambda-nodejs:12

COPY . /var/task/

# Install NPM dependencies for function
RUN npm install

RUN mv jest.config.js.lambda jest.config.js

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "runner.handler" ]