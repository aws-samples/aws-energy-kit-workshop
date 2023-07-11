import React, { useState } from "react"
import FileInput, { FileDetails } from "../../../front_end_library/@amzn/meridian/file-input"
import  {Amplify, Auth, Storage } from 'aws-amplify'
import {withAuthenticator} from "@aws-amplify/ui-react"
import useAmplifyAuth from '../../components/hooks/use-amplify-auth'
import { AmplifyConfig } from '../../config/amplify-config';

Amplify.configure(AmplifyConfig);

const UploadFile = () => {
  const [percentage, setPercentage] = useState(undefined)
  const [files, setFiles] = useState([])
  return (
    <FileInput
      
      onFileAttached={acceptedFiles => {
        acceptedFiles.forEach(file => {
          console.log(file.name)
          console.log(file)
          const upload = Storage.put(file.name, file, {
            resumable: true,
            completeCallback: (event) => {
              file.percentage = 100
              console.log(file.percentage)
              console.log(`Successfully uploaded ${event.key}`);
            },
            progressCallback: (progress) => {
              file.percentage = 100*((progress.loaded)/(progress.total))
              console.log(file.percentage)
              console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
            },
            errorCallback: (err,upload) => {
              console.error('Unexpected error while uploading', err);
            }
          });
          file.uploadedFileHref = upload.fileId;
          file.cancel = upload.pause(0, setPercentage)
        })
        setFiles([...files, ...acceptedFiles])
      }}
      type="multiple"
    >
      {files.map(file => {
        return (
          <FileDetails
            error={file.error}
            errorMessage={file.errorMessage}
            file={file}
            connectionSpeed="10MB/s"
            uploadPercentage={file.percentage}
            key={file.name}
            onClickCancel={() => {
              file.cancel()
              const updatedFileArr = files.filter(fl => fl.name !== file.name)
              setFiles(updatedFileArr)
            }}
            onClickRemoveFile={() => {
              const updatedFileArr = files.filter(fl => fl.name !== file.name)
              setFiles(updatedFileArr)
            }}
            uploadComplete={file.percentage === 100}
          />
        )
      })}
    </FileInput>
  )
}

export default UploadFile;