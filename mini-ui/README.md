# Install and run
Install ffmpeg on the system that will run the server (needed for user04). eg. for Linux (Ubuntu) this would be:

    apt install ffmpeg


Clone the repo locally and run the following code from a command prompt:

    cd mini-ui-nodejs
    npm i


This won't make it work because you need to put in some environment variables (either in the system, or by creating a .env file): 

    USER04_SECRET=
    AMAZONPROXY_USERNAME=
    AMAZONPROXY_SECRET=

USER04_SECRET can be whatever you choose the user04's password to be.

Now, you can run 

    npm start