import { Sentry } from "@oneblink/apps"
import * as bulmaToast from "bulma-toast"
import fileSaver from "file-saver"
import { Attachment } from "../types/attachments"
import { urlToBlobAsync } from "./blob-utils"

async function downloadFile(data: Blob | string, fileName: string) {
  if (window.cordova) {
    const file = typeof data === "string" ? await urlToBlobAsync(data) : data
    await new Promise((resolve, reject) => {
      //@ts-expect-error apps-react stuff
      window.requestFileSystem(
        //@ts-expect-error apps-react stuff
        window.PERSISTENT,
        0,
        (fs: any) => {
          fs.root.getFile(
            fileName,
            {
              create: true,
              exclusive: false,
            },
            (fileEntry: any) => {
              // Create a FileWriter object for our FileEntry
              fileEntry.createWriter(
                (fileWriter: any) => {
                  fileWriter.onwriteend = () => {
                    // @ts-expect-error ???
                    window.cordova.plugins.fileOpener2.open(
                      fileEntry.nativeURL,
                      file.type,
                      {
                        error: (error: Error) => {
                          console.log(
                            "An error occurred opening the downloaded file"
                          )
                          reject(error)
                        },
                        success: () => resolve(undefined),
                      }
                    )
                  }

                  fileWriter.onerror = (error: any) => {
                    console.log(
                      "An error occurred writing the file to file system"
                    )
                    reject(error)
                  }

                  fileWriter.write(file)
                },
                (error: any) => {
                  console.log(
                    "An error attempting to create file writer for new file"
                  )
                  reject(error)
                }
              )
            },
            (error: any) => {
              console.log(
                "An error occurred getting new file data from file system"
              )
              reject(error)
            }
          )
        },
        (error: any) => {
          console.log("An error occurred requesting access to the file system")
          reject(error)
        }
      )
    })
    return
  } else {
    fileSaver.saveAs(data, fileName)
  }
}

const handleError = (error?: Error) => {
  if (error) {
    console.warn("An error occurred attempting to download file:", error)
    Sentry.captureException(error)
    bulmaToast.toast({
      message:
        "Sorry, there was an issue downloading your file, please try again.",
      // @ts-expect-error bulma sets this string as a class, so we are hacking in our own classes
      type: "ob-toast is-danger cypress-download-file-toast",
      dismissible: true,
      closeOnClick: true,
    })
  }
}

export async function downloadFileLegacy(dataURI: string, fileName: string) {
  try {
    return await downloadFile(dataURI, fileName)
  } catch (error) {
    handleError(error as Error)
  }
}

export default async function downloadAttachment(attachment: Attachment) {
  try {
    if (attachment.type) {
      return await downloadFile(attachment.data, attachment.fileName)
    }
    if (!attachment.isPrivate) {
      return await downloadFile(attachment.url, attachment.fileName)
    }
    const blob = await urlToBlobAsync(attachment.url, attachment.isPrivate)
    return await downloadFile(blob, attachment.fileName)
  } catch (error) {
    handleError(error as Error)
  }
}
