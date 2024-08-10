document.addEventListener('DOMContentLoaded', (event) => {
    fetchUserProfile();
    fetchPatients();
    fetchTotalPatients();
    

    // View Diagnosis functionality
    const viewDiagnosisModal = document.getElementById('viewDiagnosisModal');
    const retrievePatientBtn = document.getElementById('retrievePatientBtn');
    const patientDetails = document.getElementById('patientDetails');
    const viewPatientIdInput = document.getElementById('viewPatientIdInput');
    
    retrievePatientBtn.addEventListener('click', function() {
        const patientId = viewPatientIdInput.value;
        if (!patientId) {
            alert('Please enter a Patient ID');
            return;
        }
        viewPatient(patientId);
    });

    // // Download Report functionality (placeholder)
    // const downloadReportBtn = document.getElementById('downloadReportBtn');
    // downloadReportBtn.addEventListener('click', function() {
    //     alert('Report download functionality will be implemented in the future.');
    // });

    // Notification functionality (placeholder)
    const notificationBtn = document.querySelector('[data-target="#notificationModal"]');
    notificationBtn.addEventListener('click', function() {
        console.log('Fetching notifications...');
    });
});

// Function to add event listeners to patient action buttons
function addPatientEventListeners() {
    document.querySelectorAll('.view-patient').forEach(button => {
        button.addEventListener('click', () => viewPatient(button.getAttribute('data-id')));
    });
    document.querySelectorAll('.edit-patient').forEach(button => {
        button.addEventListener('click', () => editPatient(button.getAttribute('data-id')));
    });
    document.querySelectorAll('.delete-patient').forEach(button => {
        button.addEventListener('click', () => deletePatient(button.getAttribute('data-id')));
    });
}

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
        console.log('User Profile Data:', data);  // Debugging log
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

// Function to fetch total number of patients
function fetchTotalPatients() {
    fetch('http://127.0.0.1:5000/api/patients?page=1&limit=1', {
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
        if (data.total !== undefined) {
            document.getElementById('totalPatients').textContent = data.total;
        } else {
            throw new Error('Total patients count not available in the response');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('totalPatients').textContent = 'Error';
    });
}

// Function to handle logout
function handleLogout() {
    // Remove the JWT token from localStorage
    localStorage.removeItem('access_token');

    // Redirect to the login page (adjust the URL as needed)
    window.location.href = '../pages/login.html';
}

// Add event listener to the logout link
document.getElementById('logoutLink').addEventListener('click', handleLogout);

let currentPage = 1;
const itemsPerPage = 10;

function fetchPatients(page = 1) {
    const patientList = document.getElementById('patientList');
    patientList.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></td></tr>';
    
    const token = localStorage.getItem('access_token');
    if (!token) {
        patientList.innerHTML = '<tr><td colspan="6" class="text-center">Please log in to view patients.</td></tr>';
        return;
    }

    fetch(`http://127.0.0.1:5000/api/patients?page=${page}&limit=${itemsPerPage}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (response.status === 401) {
            throw new Error('Unauthorized: Please log in again.');
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received patient data:', data);
        patientList.innerHTML = '';
        if (data.patients.length === 0) {
            patientList.innerHTML = '<tr><td colspan="6" class="text-center">No patients found.</td></tr>';
        } else {
            data.patients.forEach((patient, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${(data.page - 1) * data.per_page + index + 1}</td>
                    <td>${patient.patient_id || 'N/A'}</td>
                    <td>${patient.name || 'N/A'}</td>
                    <td>${patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'Invalid Date'}</td>
                    <td><span class="badge badge-warning">Unknown</span></td>
                    <td>
                        <button class="btn btn-sm btn-info view-patient" data-id="${patient.patient_id}"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-primary edit-patient" data-id="${patient.patient_id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-patient" data-id="${patient.patient_id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                patientList.appendChild(row);
            });
        }

        updatePagination(data.totalPages, data.page, data.total);
        addPatientEventListeners();
    })
    .catch((error) => {
        console.error('Error fetching patients:', error);
        patientList.innerHTML = `<tr><td colspan="6" class="text-center">Error: ${error.message}</td></tr>`;
        if (error.message.includes('Unauthorized')) {
            localStorage.removeItem('access_token');
            // Redirect to login page or show login modal
        }
    });
}

function updatePagination(totalPages, currentPage, totalPatients) {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (Total Patients: ${totalPatients})`;

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchPatients(currentPage);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = parseInt(document.getElementById('pageInfo').textContent.split(' of ')[1].split(' ')[0]);
    if (currentPage < totalPages) {
        currentPage++;
        fetchPatients(currentPage);
    }
});

// Initial fetch
fetchPatients(currentPage);

// Function to view patient details
function viewPatient(id) {
    fetch(`http://127.0.0.1:5000/api/patients/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Patient not found');
        }
        return response.json();
    })
    .then(data => {
        displayPatientData(data);
        $('#viewDiagnosisModal').modal('show'); // Show the modal
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.message);
    });
}

// Function to display patient data
function displayPatientData(patient) {
    document.getElementById('viewPatientId').textContent = patient.patient_id;
    document.getElementById('viewPatientName').textContent = patient.name;
    document.getElementById('viewPatientAge').textContent = patient.age;
    document.getElementById('viewPatientGender').textContent = patient.gender;

    // Display sample images
    const sampleImagesContainer = document.getElementById('sampleImages');
    sampleImagesContainer.innerHTML = ''; // Clear previous images
    if (patient.images && patient.images.length > 0) {
        patient.images.forEach(image => {
            const img = document.createElement('img');
            img.src = image.file_path;
            img.alt = 'Sample Image';
            img.className = 'img-thumbnail m-1';
            img.style.maxWidth = '100px';
            sampleImagesContainer.appendChild(img);
        });
    } else {
        sampleImagesContainer.textContent = 'No images available';
    }

    // Display diagnosis results
    const diagnosisResultsContainer = document.getElementById('diagnosisResults');
    diagnosisResultsContainer.innerHTML = ''; // Clear previous results
    if (patient.diagnosis_results && patient.diagnosis_results.length > 0) {
        patient.diagnosis_results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.innerHTML = `
                <p><strong>Image ID:</strong> ${result.image_id}</p>
                <p><strong>Parasite Name:</strong> ${result.parasite_name}</p>
                <p><strong>Average Confidence:</strong> ${result.average_confidence}%</p>
                <p><strong>Count:</strong> ${result.count}</p>
                <p><strong>Severity Level:</strong> ${result.severity_level}</p>
                <p><strong>Status:</strong> ${result.status}</p>
                <p><strong>Result Date:</strong> ${new Date(result.result_date).toLocaleString()}</p>
                <hr>
            `;
            diagnosisResultsContainer.appendChild(resultElement);
        });
    } else {
        diagnosisResultsContainer.textContent = 'No diagnosis results available';
    }

    // Show patient details
    patientDetails.style.display = 'block';
}

// // Additional logic for enabling/disabling the view button
// function addPatientEventListeners() {
//     document.querySelectorAll('.view-patient').forEach(button => {
//         const patientId = button.getAttribute('data-id');
//         fetch(`http://127.0.0.1:5000/api/patients/${patientId}/results`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': 'Bearer ' + localStorage.getItem('access_token')
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.resultsAvailable) {
//                 button.disabled = false; // Enable button if results are available
//             } else {
//                 button.disabled = true;  // Disable button if no results
//             }
//         });
//     });
// }
// Function to edit patient
function editPatient(id) {
    fetch(`http://127.0.0.1:5000/api/patients/${id}`, {
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
    .then(patient => {
        document.getElementById('editPatientNameInput').value = patient.name;
        document.getElementById('editPatientAgeInput').value = patient.age;
        document.getElementById('editPatientGenderInput').value = patient.gender.toLowerCase();
        document.getElementById('editPatientAddressInput').value = patient.address;
        document.getElementById('editPatientForm').setAttribute('data-patient-id', id);
        $('#editPatientModal').modal('show');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to fetch patient data for editing');
    });
}

// Function to delete patient
function deletePatient(id) {
    if (confirm('Are you sure you want to delete this patient?')) {
        fetch(`http://127.0.0.1:5000/api/patients/${id}`, {
            method: 'DELETE',
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
            alert('Patient deleted successfully!');
            fetchPatients(); // Refresh the patient list
            fetchTotalPatients(); // Update total patients count
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete patient');
        });
    }
}

// Function to update the activity log
function updateActivityLog(activity) {
    const activityLog = document.getElementById('activityLog');
    activityLog.innerHTML = ''; // Clear previous log
    const newActivity = document.createElement('li');
    newActivity.className = 'list-group-item';
    newActivity.textContent = activity;
    activityLog.appendChild(newActivity); // Add new activity at the top
}

// Function to handle manual patient registration
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
        fetchPatients(currentPage); // Refresh the patient list
        fetchTotalPatients(); // Update total patients count
        resetForm();
        updateActivityLog(`New patient registered: ${data.patient.name}`);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to register patient');
    });
}

// Function to handle CSV import
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

// Function to parse CSV (continued)
function parseCSV(csv) {
    const lines = csv.split('\n');
    const patients = [];
    for (let i = 1; i < lines.length; i++) {
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

// Function to register patients from CSV
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
            fetchTotalPatients(); // Update total patients count
            resetForm();
            updateActivityLog(`Multiple patients registered from CSV`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to register some or all patients from CSV');
        });
}

// Function to handle edit patient form submission
function handleEditPatientSubmission(event) {
    event.preventDefault();
    const patientId = event.target.getAttribute('data-patient-id');
    const patientData = {
        name: document.getElementById('editPatientNameInput').value,
        age: document.getElementById('editPatientAgeInput').value,
        gender: document.getElementById('editPatientGenderInput').value.toLowerCase(),
        address: document.getElementById('editPatientAddressInput').value
    };
    fetch(`http://127.0.0.1:5000/api/patients/${patientId}`, {
        method: 'PUT',
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
        alert('Patient updated successfully!');
        $('#editPatientModal').modal('hide');
        fetchPatients(); // Refresh the patient list
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update patient');
    });
}

// Function to reset forms
function resetForm() {
    document.getElementById('registerPatientForm').reset();
    document.getElementById('csvFile').value = '';
}

// Event listeners
document.getElementById('registerPatientForm').addEventListener('submit', handleManualRegistration);
document.getElementById('importPatientForm').addEventListener('submit', handleCSVImport);
document.getElementById('editPatientForm').addEventListener('submit', handleEditPatientSubmission);
document.getElementById('profileLink').addEventListener('click', () => $('#profileModal').modal('show'));
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '../pages/login.html';
});

// Modal event listeners for resetting forms on close
$('#registerPatientModal').on('hidden.bs.modal', resetForm);
$('#editPatientModal').on('hidden.bs.modal', () => document.getElementById('editPatientForm').reset());

// Function to handle the download report functionality
document.getElementById('downloadReportBtn').addEventListener('click', function() {
    // Retrieve patient details
    const patientId = document.getElementById('viewPatientId').textContent;
    const patientName = document.getElementById('viewPatientName').textContent;
    const patientAge = document.getElementById('viewPatientAge').textContent;
    const patientGender = document.getElementById('viewPatientGender').textContent;

    // Retrieve diagnosis results
    const diagnosisResults = [];
    const resultEntries = document.querySelectorAll('#diagnosisResults .diagnosis-entry');
    resultEntries.forEach(entry => {
        const parasiteName = entry.querySelector('.parasite-name').textContent;
        const averageConfidence = entry.querySelector('.average-confidence').textContent;
        const count = entry.querySelector('.count').textContent;
        const severityLevel = entry.querySelector('.severity-level').textContent;
        const status = entry.querySelector('.status').textContent;

        diagnosisResults.push({
            parasiteName,
            averageConfidence,
            count,
            severityLevel,
            status
        });
    });

    // Get the selected format
    const format = document.getElementById('reportFormat').value;

    // Generate the report content
    let reportContent = '';

    if (format === 'txt') {
        reportContent += `Patient ID: ${patientId}\n`;
        reportContent += `Name: ${patientName}\n`;
        reportContent += `Age: ${patientAge}\n`;
        reportContent += `Gender: ${patientGender}\n\n`;
        reportContent += `Diagnosis Results:\n`;

        diagnosisResults.forEach(result => {
            reportContent += `\nParasite Name: ${result.parasiteName}\n`;
            reportContent += `Average Confidence: ${result.averageConfidence}\n`;
            reportContent += `Count: ${result.count}\n`;
            reportContent += `Severity Level: ${result.severityLevel}\n`;
            reportContent += `Status: ${result.status}\n`;
        });

        // Create and download the TXT file
        downloadFile(reportContent, `${patientName}_Diagnosis_Report.txt`, 'text/plain');

    } else if (format === 'csv') {
        reportContent += `Patient ID,${patientId}\n`;
        reportContent += `Name,${patientName}\n`;
        reportContent += `Age,${patientAge}\n`;
        reportContent += `Gender,${patientGender}\n\n`;
        reportContent += `Parasite Name,Average Confidence,Count,Severity Level,Status\n`;

        diagnosisResults.forEach(result => {
            reportContent += `${result.parasiteName},${result.averageConfidence},${result.count},${result.severityLevel},${result.status}\n`;
        });

        // Create and download the CSV file
        downloadFile(reportContent, `${patientName}_Diagnosis_Report.csv`, 'text/csv');

    } else if (format === 'pdf') {
        // Generate the PDF content using jsPDF library
        const doc = new jsPDF();
        doc.text(`Patient ID: ${patientId}`, 10, 10);
        doc.text(`Name: ${patientName}`, 10, 20);
        doc.text(`Age: ${patientAge}`, 10, 30);
        doc.text(`Gender: ${patientGender}`, 10, 40);

        let yPosition = 60;
        doc.text(`Diagnosis Results:`, 10, yPosition);
        yPosition += 10;

        diagnosisResults.forEach(result => {
            doc.text(`Parasite Name: ${result.parasiteName}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Average Confidence: ${result.averageConfidence}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Count: ${result.count}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Severity Level: ${result.severityLevel}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Status: ${result.status}`, 10, yPosition);
            yPosition += 20;
        });

        // Save the PDF
        doc.save(`${patientName}_Diagnosis_Report.pdf`);
    }
});

// Helper function to create and download a file
function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}
