//Logic for Login/Signup page

function searchbar() {
  const query = document.getElementById("SearchQuery").value;
  if(query) {
    alert("Searching for: " + query);
    // Later you can connect this to backend or product search
  } else {
    alert("Please enter a search term.");
  }
}
