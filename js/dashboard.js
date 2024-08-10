document.addEventListener('DOMContentLoaded', function() {
    
      // Function to fetch logged-in user's profile
      function fetchUserProfile() {
        fetch('http://127.0.0.1:5000/api/user/profile', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('loggedInUser').textContent = data.username;
            document.getElementById('profileUsername').textContent = data.username;
            document.getElementById('profileEmail').textContent = data.email;
            document.getElementById('profileRole').textContent = data.role;
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to fetch user profile');
        });
    }

    // Call fetchUserProfile on page load to display the logged-in user's name
    fetchUserProfile();

    // Show profile modal when profile link is clicked
    document.getElementById('profileLink').addEventListener('click', function() {
        $('#profileModal').modal('show');
    });

    // Logout functionality
    document.getElementById('logout').addEventListener('click', function() {
        localStorage.removeItem('access_token');
        window.location.href = 'login.html'; // Redirect to login page
    });

  // Function to fetch total number of patients
function fetchTotalPatients() {
    fetch('http://127.0.0.1:5000/api/patients', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('totalPatients').textContent = data.length;
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('totalPatients').textContent = 'Error';
        // alert('Failed to fetch total patients');
    });
}

    
    function fetchPatients() {
        const patientList = document.getElementById('patientList');
        patientList.innerHTML = '<tr><td colspan="6">Loading patients...</td></tr>';
        fetch('http://127.0.0.1:5000/api/patients', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received patient data:', data);
            const patientList = document.getElementById('patientList');
            patientList.innerHTML = '';
            data.forEach((patient, index) => {
                console.log('Processing patient:', patient);  // Log each patient
                const id = patient.patient_id || 'N/A';
                const name = patient.name || 'N/A';
                const date = patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'Invalid Date';
                const status = 'Unknown';  // Status is not in the current data, so we'll use 'Unknown'
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${id}</td>
                    <td>${name}</td>
                    <td>${date}</td>
                    <td><span class="badge badge-warning">${status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info view-patient" data-id="${id}"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-primary edit-patient" data-id="${id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-patient" data-id="${id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                
                // Add event listeners directly to the buttons
                row.querySelector('.view-patient').addEventListener('click', () => viewPatient(id));
                row.querySelector('.edit-patient').addEventListener('click', () => editPatient(id));
                row.querySelector('.delete-patient').addEventListener('click', () => deletePatient(id));
                
                patientList.appendChild(row);
            });
        })
        .catch((error) => {
            console.error('Error fetching patients:', error);
            document.getElementById('patientList').innerHTML = `<tr><td colspan="6">Error fetching patients: ${error.message}</td></tr>`;
        });
    }
    
    // Define these functions to handle the button clicks
    function viewPatient(id) {
        console.log(`View patient with id ${id}`);
        // Implement view functionality
    }
    
    function editPatient(id) {
        console.log(`Edit patient with id ${id}`);
        // Implement edit functionality
    }
    
    function deletePatient(id) {
        console.log(`Delete patient with id ${id}`);
        // Implement delete functionality
    }


    fetchTotalPatients();
    fetchPatients();
    function handleManualRegistration(event) {
        event.preventDefault();
        
        const patientData = {
            name: document.getElementById('patientName').value,
            email: document.getElementById('patientEmail').value,
            age: document.getElementById('patientAge').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            address: document.getElementById('patientAddress').value
        };
    
        fetch('http://127.0.0.1:5000/api/patients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            body: JSON.stringify(patientData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert('Patient registered successfully!');
            $('#registerPatientModal').modal('hide');
            fetchPatients(); // Refresh the patient list
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to register patient');
        });
    }
    function handleCSVImport(event) {
        event.preventDefault();
        
        const fileInput = document.getElementById('csvFile');
        const file = fileInput.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const csv = e.target.result;
                const patients = parseCSV(csv);
                registerPatientsFromCSV(patients);
            };
            reader.readAsText(file);
        }
    }
    
    function parseCSV(csv) {
        const lines = csv.split('\n');
        const patients = [];
        for (let i = 1; i < lines.length; i++) { // Start from 1 to skip header
            const values = lines[i].split(',');
            if (values.length === 5) {
                patients.push({
                    name: values[0].trim(),
                    email: values[1].trim(),
                    age: values[2].trim(),
                    gender: values[3].trim(),
                    address: values[4].trim()
                });
            }
        }
        return patients;
    }
    
    function registerPatientsFromCSV(patients) {
        const promises = patients.map(patient => 
            fetch('http://127.0.0.1:5000/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
                body: JSON.stringify(patient)
            })
        );
    
        Promise.all(promises)
            .then(() => {
                alert('All patients from CSV registered successfully!');
                $('#registerPatientModal').modal('hide');
                fetchPatients(); // Refresh the patient list
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to register some or all patients from CSV');
            });
    }
    function resetForm() {
        document.getElementById('registerPatientForm').reset();
        document.getElementById('csvFile').value = '';
    }
    

    // Function to show patient details in the modal
    function showPatientDetails(patientId) {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
            document.getElementById('viewPatientId').textContent = patient.id;
            document.getElementById('viewPatientName').textContent = patient.name;
            document.getElementById('viewPatientAge').textContent = patient.age;
            document.getElementById('viewPatientGender').textContent = patient.gender;
            document.getElementById('viewStatus').textContent = patient.status;
            document.getElementById('patientDetails').style.display = 'block';
        } else {
            alert('Patient not found');
        }
    }

    // Event listener for view buttons
    document.querySelectorAll('.btn-info').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const patientId = this.closest('tr').querySelector('td:nth-child(2)').textContent;
            alert('View button clicked for patient ' + patientId);
            showPatientDetails(patientId);
            $('#viewDiagnosisModal').modal('show');
        });
    });

    // Event listener for edit buttons
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const patientId = this.closest('tr').querySelector('td:nth-child(2)').textContent;
            const patient = patients.find(p => p.id === patientId);
            if (patient) {
                // Populate the edit modal with patient data
                document.getElementById('editPatientNameInput').value = patient.name;
                document.getElementById('editPatientAgeInput').value = patient.age;
                document.getElementById('editPatientGenderInput').value = patient.gender;
                document.getElementById('editPatientAddressInput').value = patient.address;
                
                // Show the edit modal
                $('#editPatientModal').modal('show');
            } else {
                console.error('Patient not found:', patientId);
            }
        });
    });

    // Event listener for edit form submission
    document.getElementById('editPatientForm').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        // Here you would typically send the updated data to your backend
        // For now, we'll just log it to the console
        console.log('Updated patient data:', {
            name: document.getElementById('editPatientNameInput').value,
            age: document.getElementById('editPatientAgeInput').value,
            gender: document.getElementById('editPatientGenderInput').value,
            address: document.getElementById('editPatientAddressInput').value
        });
        $('#editPatientModal').modal('hide');
    });

    // Event listener for delete buttons
    document.querySelectorAll('.btn-danger').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const patientId = this.closest('tr').querySelector('td:nth-child(2)').textContent;
            if (confirm('Are you sure you want to delete patient ' + patientId + '?')) {
                alert('Delete functionality for patient ' + patientId + ' not implemented yet.');
            }
        });
    });

    // Notification functionality
    const notificationButton = document.querySelector('.notification-icon');
    const notificationBadge = notificationButton.querySelector('.notification-badge');

    notificationButton.addEventListener('click', function(e) {
        e.preventDefault();
        $('#notificationModal').modal('show');
        // Reset notification count
        notificationBadge.textContent = '0';
        notificationBadge.style.display = 'none';
    });

    // Function to add a new notification (for demonstration)
    function addNotification(message) {
        const notificationList = document.querySelector('#notificationModal .modal-body ul');
        const newNotification = document.createElement('li');
        newNotification.textContent = message;
        newNotification.className = 'list-group-item';
        notificationList.appendChild(newNotification);

        // Update notification badge
        const currentCount = parseInt(notificationBadge.textContent);
        notificationBadge.textContent = currentCount + 1;
        notificationBadge.style.display = 'inline';
    }

    // Example usage of addNotification (you can call this function when new notifications arrive)
    // addNotification('New test result available for Patient ID: 12347');

    // Event listener for the patient retrieval in the view diagnosis modal
    document.getElementById('retrievePatientBtn').addEventListener('click', function() {
        const patientId = document.getElementById('viewPatientIdInput').value;
        showPatientDetails(patientId);
    });

 
    // Handle image upload form submission
    $('#uploadImageForm').submit(function(event) {
        event.preventDefault();
        alert('Image uploaded successfully!');
        $('#uploadImageModal').modal('hide');
    });

    // Handle download report button click
    $('#downloadReportButton').click(function() {
        alert('Report download functionality to be implemented.');
    });

    

    // Handle multiple image selection
    $('#diagnosisImages').change(function() {
        var files = $(this)[0].files;
        var container = $('#imageDetailsContainer');
        container.empty(); // Clear previous entries

        for (var i = 0; i < files.length; i++) {
            var imageDetails = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Image ${i + 1}: ${files[i].name}</h5>
                        <div class="form-group">
                            <label for="smearType${i}">Smear Type</label>
                            <select class="form-control smearType" id="smearType${i}" required>
                                <option value="" disabled selected>Select Smear Type</option>
                                <option value="thick">Thick</option>
                                <option value="thin">Thin</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="testType${i}">Test Type</label>
                            <input type="text" class="form-control testType" id="testType${i}" placeholder="Enter Test Type" required>
                        </div>
                    </div>
                </div>
            `;
            container.append(imageDetails);
        }
    });

    // Handle form submission for image upload with multiple images
    $('#uploadImageForm').submit(function(event) {
        event.preventDefault();
        var patientId = $('#patientId').val();
        var files = $('#diagnosisImages')[0].files;
        var imagesData = [];

        for (var i = 0; i < files.length; i++) {
            imagesData.push({
                file: files[i],
                smearType: $(`#smearType${i}`).val(),
                testType: $(`#testType${i}`).val()
            });
        }

        // Here you would typically send this data to your backend
        console.log("Patient ID:", patientId);
        console.log("Images Data:", imagesData);

        // For demonstration, let's just show an alert
        alert(`Uploading ${files.length} image(s) for Patient ID: ${patientId}`);

        // Close the modal after submission
        $('#uploadImageModal').modal('hide');
    });
    // Add this at the end of your DOMContentLoaded event listener
$('.modal .close, .modal .btn-close').on('click', function() {
    $(this).closest('.modal').modal('hide');
});
$('#editPatientModal .close, #editPatientModal .btn-secondary').on('click', function() {
    console.log('Edit modal close button clicked');
    $('#editPatientModal').modal('hide');
});

});
