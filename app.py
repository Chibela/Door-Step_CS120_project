from flask import Flask, render_template, request, redirect, flash
import csv, os

app = Flask(__name__)
app.secret_key = "secret101"  # Needed for flash messages

CSV_FILE = os.path.join("FoodTruckService", "users.csv")

# This below ensures CSV file exists
if not os.path.exists(CSV_FILE) or os.path.getsize(CSV_FILE) == 0:
    with open(CSV_FILE, "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["First_Name", "Last_Name", "Email", "Phone_Number"])

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        first = request.form["first_name"]
        last = request.form["last_name"]
        email = request.form["email"]
        phone = request.form["phone"]

        # Check if email already exists
        with open(CSV_FILE, "r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                if row["Email"] == email:
                    flash("You already have an account. Please log in!")
                    return redirect("/login")  # This will direct them to login page

        # If not found, save user details into CSV
        with open(CSV_FILE, "a", newline="") as file:
            writer = csv.writer(file)
            writer.writerow([first, last, email, phone])

        flash("Signup was successful! You can now log in.")
        return redirect("/login") # This will also direct them to the login page
    
    return render_template("signup.html")

if __name__ == "__main__":
    app.run(debug=True)