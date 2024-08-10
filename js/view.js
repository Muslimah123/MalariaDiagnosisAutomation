document.addEventListener('DOMContentLoaded', (event) => {
    // ... (previous code remains the same)

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

        fetch(`http://127.0.0.1:5000/api/patients/${patientId}`, {
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
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
    });

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
                    <p><strong>Parasite Detected:</strong> ${result.parasite_detected ? 'Yes' : 'No'}</p>
                    <p><strong>WBC Count:</strong> ${result.wbc_count}</p>
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

    // Download Report functionality (placeholder)
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    downloadReportBtn.addEventListener('click', function() {
        alert('Report download functionality will be implemented in the future.');
    });

    // Notification functionality (placeholder)
    const notificationBtn = document.querySelector('[data-target="#notificationModal"]');
    notificationBtn.addEventListener('click', function() {
        // In the future, you can fetch real notifications here
        console.log('Fetching notifications...');
    });
});