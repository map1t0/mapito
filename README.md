# Mapito.org: Open Geographic Platform for Locative Media Apps


Mapito is a web application that facilitates the creation of a map with custom controls and embedding it in a website. Mapito using multiple map services such as Google Maps and Bing Maps. The main feature here is the one-click switching between of these map services without affecting the previous settings. The system records the users activity on a map and stores it for later processing and analysis.

Route tracking is an additional feature of this system which allows to track routes through a web browser of a smartphone or tablet with GPS and HTML5 Geolocation support. GPS Track Smoothing is an another useful feature provided by Mapito and designed to remove outliers in trace data. 

This web application provides two APIs. A JavaScript API that's designed for developers who use embedded Mapito Maps and provides methods to edit the maps. A HTTP API which is designed for web and mobile developers and provides all options of Mapito via HTTP requests and more options, such as for storing and retrieving gps routes. 

Mapito is an open data and open source GIS system with an API that facilitates the development of Web services and Mobile Apps. Mapito is creating an abstraction layer above the generic services offered by the major web-based GIS systems, in order to facilitate the migration of the user applications to new services. 

## Technologies and tools

This web application integrates the following technologies and tools:

* HTML5
* CSS3
* JavaScript
* JQuery
* Bootstrap
* Node.js
* MongoDB
* Google Maps API
* Bing Maps API

## Example

Mapito is currently running at http://www.mapito.org.


## Building the code

1. Install [Node.js](https://nodejs.org/)

2. Install [npm](http://blog.npmjs.org/post/85484771375/how-to-install-npm)

3. Install [MongoDB](http://docs.mongodb.org/manual/installation/)

4. Download or clone the code:

  ```
  git clone https://github.com/map1t0/mapito.git
  ```
  
5. Use `npm` to install all dependencies for this app:

  ```
  cd ./mapito
  npm install
  ```
6. Open the file `./mapito/public/javascript/embed.js` and type in the first line your domain. If you're running the app in localhost type `http://127.0.0.1:3000`. (See the comments in the file).

7. Open the file `./mapito/config/auth.js` and type in `mailer` your gmail and password. (See the comments in the file).

8. Create a new project on [Google console](https://console.developers.google.com/). Go to `APIs & auth` -> `Credentials` and click on `Create new Client ID`. In the `Authorized JavaScript origins`type your domain and in `Authorized redirect URIs` enter `http://YOUR_DOMAIN/auth/google/callback`. Next copy the `Client ID` and `Client secret` and paste in the `./mapito/config/auth.js` file. (See the comments in the file).

9. Create a new apllication on [Facebook](https://developers.facebook.com/apps/). Next copy the `App ID` and `App Secret` and paste in the the `./mapito/config/auth.js` file. (See the comments in the file).

10. Run the app:

  ```
  nodejs app.js
  ```

11. Open the app in your browser using the address `http://127.0.0.1:3000`.


##  npm packages used
* [`express`](https://www.npmjs.com/package/express): Web framework
* [`ejs`](https://www.npmjs.com/package/ejs): View templating
* [`mongoose`](https://www.npmjs.com/package/mongoose): MongoDB object modeling tool
* [`passport`](https://www.npmjs.com/package/passport):  Authentication middleware
* [`passport-facebook`](https://www.npmjs.com/package/passport-facebook): Facebook authentication strategy for Passport
* [`passport-google-oauth`](https://www.npmjs.com/package/passport-google-oauth): Google authentication strategies for Passport
* [`passport-local`](https://www.npmjs.com/package/passport-local): Local authentication strategy for Passport
* [`serve-favicon`](https://www.npmjs.com/package/serve-favicon): Favicon serving middleware
* [`connect-mongo`](https://www.npmjs.com/package/connect-mongo): MongoDB session store
* [`bcrypt-nodejs`](https://www.npmjs.com/package/bcrypt-nodejs): JS bcrypt library
* [`body-parser`](https://www.npmjs.com/package/body-parser): Body parsing middleware
* [`cookie-parser`](https://www.npmjs.com/package/cookie-parser): Cookie parsing
* [`connect-flash`](https://www.npmjs.com/package/connect-flash): Flash message middleware
* [`cookie-session`](https://www.npmjs.com/package/cookie-session): cookie session middleware
* [`errorhandler`](https://www.npmjs.com/package/errorhandler): Error handler middleware
* [`express-session`](https://www.npmjs.com/package/express-session): Session middleware
* [`method-override`](https://www.npmjs.com/package/method-override): Override HTTP verbs
* [`morgan`](https://www.npmjs.com/package/morgan): HTTP request logger
* [`node-uuid`](https://www.npmjs.com/package/node-uuid):  Implementation of RFC4122 (v1 and v4) UUIDs.
* [`nodemailer`](https://www.npmjs.com/package/nodemailer): Mailer
* [`winston`](https://www.npmjs.com/package/winston): Logging library
* [`xmlbuilder`](https://www.npmjs.com/package/xmlbuilder): XML builder
