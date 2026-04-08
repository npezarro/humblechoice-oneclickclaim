# Humble Choice One-Click Claim

Select and claim all unclaimed Humble Choice games with one click.

## Tampermonkey Userscript (Recommended)

Install [Tampermonkey](https://www.tampermonkey.net/), then click below to install:

**[Install Userscript](https://raw.githubusercontent.com/npezarro/humblechoice-oneclickclaim/main/humblechoice-oneclickclaim.user.js)**

The script adds a floating "Claim All" button on Humble Choice pages. Click it to:
1. Activate multiselect mode
2. Select all unclaimed games
3. Submit the claim

Progress is shown in a status overlay. The script auto-updates via Tampermonkey.

## Bookmarklet (Alternative)

Create a bookmark and paste this as the URL:

```
javascript:(function(){if(!confirm('This will select and claim all unclaimed items. Proceed?')){return;}const link=document.querySelector('.choices-secondary-link.js-initialize-multiselect');if(link){link.click();console.log('Multiselect mode activated');}else{alert('Initial button not found!');return;}setTimeout(()=>{const allBoxes=document.querySelectorAll('.choice-image-container.js-admin-edit');const unclaimedBoxes=Array.from(allBoxes).filter(box=>{const contentChoice=box.closest('.content-choice');return!contentChoice||!contentChoice.classList.contains('claimed');});if(unclaimedBoxes.length>0){console.log(`Found ${unclaimedBoxes.length} unclaimed items out of ${allBoxes.length} total`);let counter=0;const clickBoxes=()=>{if(counter<unclaimedBoxes.length){unclaimedBoxes[counter].click();counter++;setTimeout(clickBoxes,50);}else{setTimeout(processClaim,300);}};clickBoxes();}else{alert('No unclaimed items found!');}},500);function processClaim(){const claimLink=document.querySelector('.choices-secondary-link.multi-claim.js-multi-claim');if(claimLink){console.log('Claiming selected items');claimLink.click();}else{alert('Claim button not found! Items may be selected but not claimed.');}}})();
```

Click the bookmark on any Humble Choice page to claim your titles.

## Demo

See demonstration: https://www.youtube.com/watch?v=YNZYoaZykYk
