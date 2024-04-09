# Zerohour Phishing Detection browser extension
This repository contains the source code of the Google Chrome browser extension part of the ZPD decision-support tool.

This project originates from A Decision-Support Tool for Experimentation on Zero-Hour Phishing Detection. Burda, P., Allodi, L., Zannone, N. (2023). In: Foundations and Practice of Security. FPS 2022. LNCS, vol 13877. Springer. https://doi.org/10.1007/978-3-031-30122-3_27

## Installation
To install this extension in your browser, you first need to have Google Chrome installed. Then, navigate to the URL `chrome://extensions/`, by copy-pasting it in the URL bar or by clicking the extension icon (puzzle piece) in the top right and selecting Manage extensions.

After opening the extensions page, you need to turn on developer mode with the switch in the top right of the page. Next, you select 'Load unpacked' and navigate in the file explorer menu to the soure code of this repository (download the repository if you haven't done so already). Choose the `src` directory within the project folder.

The browser extension is now installed! See the next section, [Setting up](#setting-up) for configuring the extension to your needs.

## Setting up
After installing the extension, you want to configure it. This can be done by clicking the extension icon (which may either be next to the puzzle piece on the top right of your browser, or under it after clicking the puzzle piece). You'll then see a small popup from the extension, with a cog in the top right. Hit the cog, and you'll be taken to the settings page.

### Connection
On this page, you'll see a few tabs. The first one you'll want to navigate to is the connection tab: here, you can configure which server the browser extension should be talking to. For developers, the default localhost should be good, but for others, you'll need to get this information from whoever is running the service.

In either case, after entering the right connection information and clicking the save button, you should hopefully see a green light saying 'Connected'. If this isn't the case, something has gone wrong, so make sure you get this working first before continuing!

### Detection
If you're using this extension as part of a user test, you may have to change the settings on the 'Detection' tab as well according to the instructions given to you. If not, the default options will be good enough.

### Notifications
In this section, you can select your preferred methods of notification. This determines how the extension will influence your browsing experience, and how it will help you make the decision on whether a page is legitimate or not.

Either select and configure the notification methods that you want, or select those required from the user test you are participating in.

## Finishing up
You are now ready to start browsing the internet! When you visit a webpage that may be susceptible to phishing, the extension will kick in and start the detection process. You can view the status of this process by looking at the extension icon (see [Setting up](#setting-up) on where to find this), or by clicking it for a larger view.

You should always keep in mind that this tool is intended to assist you, to help you make the decision. This means that the extension does not always make the right choice, and may give you the wrong verdict on a webpage. You therefore have to remain aware of what websites you are visiting, and stay alert for phishing pages.

## Uninstalling the plugin
If you wish to remove the plugin from your browser, you can navigate back to the extensions page, see [Installation](#installation). Then, hit 'Remove' twice on the Zerohour Phishing Detection extension.
