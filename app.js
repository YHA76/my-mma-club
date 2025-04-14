const registrationRoutes = require("./routes/registrationRoutes");
const inscriptionRoutes = require("./routes/inscriptionRoutes");

app.use("/api/registration", registrationRoutes);
app.use("/api/inscription", inscriptionRoutes);
