const express=require("express")
const app=express()
const admin = require("firebase-admin");
const bodyParser = require('body-parser'); 
app.use(bodyParser.json());
const serviceAccount = require("./movie-ticket-booking-sys-fa0eb-firebase-adminsdk-x06hf-8c08582504.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: "https://movie-ticket-bookingg-default-rtdb.firebaseio.com"
});
const db = admin.firestore();
const movieTicketCollection = db.collection("movie-ticket"); // Reference to the "movie-ticket" collection

app.get("/movies", async (req, res) => {
  try {
    const moviesSnapshot = await movieTicketCollection.get();
    const moviesData = [];
    moviesSnapshot.forEach((doc) => {
        const data=doc.data();
        const formattedDate = new Date(data.release_date._seconds * 1000 + data.release_date._nanoseconds / 1000000).toISOString();
      const extractedDate = formattedDate.split('T')[0];
      moviesData.push({
        id: doc.id, 
        movie_name: data.movie_name,
        theatre_name: data.theatre_name,
        theatre_location:data.theatre_location,
        release_date:extractedDate,
      });
    });
    console.log(moviesData);
    res.json({ movies: moviesData });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
}); 
app.get("/movies/:movieName", async (req, res) => {
  try {
    const movieName = req.params.movieName;

    
    const theatersSnapshot = await movieTicketCollection.where("movie_name", "==", movieName).get();

    const theatersData = [];
    theatersSnapshot.forEach((doc) => {
      const data = doc.data();
      theatersData.push({
        theatre_name: data.theatre_name,
        theatre_location: data.theatre_location
      });
    });

    res.json({ theaters: theatersData });
  } catch (error) {
    console.error("Error fetching theaters:", error);
    res.status(500).json({ error: "Failed to fetch theaters" });
  }
}); 


// POST route to handle Firestore data posting
/*app.post('/postBookingData', async (req, res) => {
  try {
    const db = admin.firestore();
    const bookingData = req.body; // Assuming the data is sent as JSON in the request body

    // Add a new document with an automatically generated ID to the "bookings" collection
    const docRef = await db.collection('bookings').add(bookingData);
    console.log('Document written with ID: ', docRef.id);

    res.status(200).json({ success: true, message: 'Data posted successfully' });
  } catch (error) {
    console.error('Error adding document: ', error);
    res.status(500).json({ success: false, message: 'Failed to post data' });
  }
});*/
app.post('/store-data', async (req, res) => {
  try {
    const {
      displayName,
      email,
      phonenumber,
      ChosenMovie,
      theatreLocation,
      theatreName,
      selectedTime,
      selectedSeats,
      numberOfSeats,
    } = req.body; // Destructure the fields from req.body

    // Create a new document in Firestore
    const dataCollection = db.collection('booking');
    const newDocRef = await dataCollection.add({
      displayName,
      email,
      phonenumber,
      ChosenMovie,
      theatreLocation,
      theatreName,
      selectedTime,
      selectedSeats,
      numberOfSeats,
      // Add other data fields here
    });

    res.status(201).json({ message: 'Data stored successfully', docId: newDocRef.id });
  } catch (error) {
    console.error('Error storing data:', error);
    res.status(500).json({ error: 'Failed to store data' });
  }
});


app.listen(5000, ()=>{console.log(`Server started on port 5000`)});
