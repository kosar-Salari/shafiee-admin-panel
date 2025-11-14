import http from './http';


export async function uploadFileToS3(file) {
  const formData = new FormData();
  formData.append('file', file); 

  const { data } = await http.post('/admin/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });


  return data.url || data.location || data.fileUrl;
}
