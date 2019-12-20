# Covigilant System

## Project Details:

Hostname: Ubuntu-18

## Software Components:

### Python Scripts

All python data scripts can be found at https://github.com/hofstra-crave/service

Here you will find our:

- Data Collections script: dataCollector.py
- MetaData script: metadata.py
- Review Script: reviews.py
- Similarity Script: similarity.py
- Twitter Authentication Script: authTwitter.py

### Web Application

All code for the web application can be found at https://github.com/hofstra-crave/back

Here you will find our:

- Server code: main.js
- Home page: public/index.html
- Restaurant Page: public/getRestaurant.html
- Frontend Javascript: public/main.js
- CSS for Restaurant: public/styles/getRestaurant.css
- CSS for Homepage: public/styles/index.css
- Shared CSS: public/styles/main.css

If either of these links are non accessible, the web application code can be found on the 10.12.22.227 VM.

### View the Web Application

To view the website go to 10.12.22.227 while connected to the Hofstra Network.

### Start the website

Before you attempt to run the website, make sure you have node.js installed. Once you have it installed run npm i to install the application's dependent libraries.

To start the website run sudo node main.js.

If you would like to run the website locally, go to the bottom of main.js and comment out lines 97-101 (the lines containing information about http), and uncomment lines 93-95 and run main.js.

### Data

Our Data is visible on the MariaDB platform that was setup for this class under Team Crave. The real data is in Restaurantz and Reviewz.

### View this Readme

To view this Readme as intended, open this file with an application that has markdown support, such as VS Code.
