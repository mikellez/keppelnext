
// generates a single QR code from the given URL
export default async function generateQRFromURL(element, url, opt = {
    width: 200,
    height: 200,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H,
})
{
    return Promise.resolve(new QRCode(
        element, url, opt));
}