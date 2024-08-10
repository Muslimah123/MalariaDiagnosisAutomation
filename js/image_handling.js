document.addEventListener('DOMContentLoaded', (event) => {
  const uploadImageForm = document.getElementById('uploadImageForm');
  const diagnosisImages = document.getElementById('diagnosisImages');
  const imageDetailsContainer = document.getElementById('imageDetailsContainer');
  const patientId = document.getElementById('patientId');

  // Handle file selection
  diagnosisImages.addEventListener('change', function(event) {
      const files = event.target.files;
      imageDetailsContainer.innerHTML = ''; // Clear previous entries

      for (let i = 0; i < files.length; i++) {
          const imageDetails = `
              <div class="card mb-3">
                  <div class="card-body">
                      <h5 class="card-title">Image ${i + 1}: ${files[i].name}</h5>
                      <div class="form-group">
                          <label for="smearType${i}">Smear Type</label>
                          <select class="form-control smearType" name="smear_type" required>
                              <option value="" disabled selected>Select Smear Type</option>
                              <option value="thick">Thick</option>
                              <option value="thin">Thin</option>
                          </select>
                      </div>
                      <div class="form-group">
                          <label for="testType${i}">Test Type</label>
                          <select class="form-control testType" name="test_type" required>
                              <option value="" disabled selected>Select Test Type</option>
                              <option value="Giemsa">Giemsa</option>
                              <option value="Wright">Wright</option>
                              <option value="Field">Field</option>
                          </select>
                      </div>
                  </div>
              </div>
          `;
          imageDetailsContainer.insertAdjacentHTML('beforeend', imageDetails);
      }
  });

  // Handle form submission
  uploadImageForm.addEventListener('submit', function(event) {
      event.preventDefault();
      console.log('Form submitted');

      const files = diagnosisImages.files;

      if (!patientId.value || files.length === 0) {
          alert('Please enter a Patient ID and select at least one image.');
          return;
      }

      const formData = new FormData();
      formData.append('patient_id', patientId.value);

      const smearTypes = document.querySelectorAll('.smearType');
      const testTypes = document.querySelectorAll('.testType');

      for (let i = 0; i < files.length; i++) {
          formData.append('images', files[i]);
          formData.append('smear_type', smearTypes[i].value);
          formData.append('test_type', testTypes[i].value);
      }

      // Log the FormData contents (for debugging)
      for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
      }

      console.log('Sending request');

      fetch('http://127.0.0.1:5000/api/images', {
          method: 'POST',
          body: formData,
          headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('access_token')
          }
      })
      .then(response => {
          console.log('Response status:', response.status);
          if (!response.ok) {
              return response.text().then(text => {
                  throw new Error(text || response.statusText);
              });
          }
          return response.json();
      })
      .then(data => {
          console.log('Success', data);
          alert('Images uploaded successfully!');
          $('#uploadImageModal').modal('hide');
          // Optionally, refresh the patient data or image list here
      })
      .catch(error => {
          console.error('Error:', error);
          alert('Error uploading images: ' + error.message);
      });
  });

  // Reset form when modal is hidden
  $('#uploadImageModal').on('hidden.bs.modal', function () {
      uploadImageForm.reset();
      imageDetailsContainer.innerHTML = '';
  });

    




});