(() => {
  const lang = document.documentElement.lang || 'en';
  if (lang === 'en') return;
  const rows = {
    'Home':['ಮುಖಪುಟ','होम'], 'Assistant':['ಸಹಾಯಕ','सहायक'], 'Government updates':['ಸರ್ಕಾರಿ ಅಪ್‌ಡೇಟ್‌ಗಳು','सरकारी अपडेट'], 'My applications':['ನನ್ನ ಅರ್ಜಿಗಳು','मेरे आवेदन'],
    'Government Services Made Simple':['ಸರ್ಕಾರಿ ಸೇವೆಗಳು ಸುಲಭವಾಗಿ','सरकारी सेवाएँ आसान'], 'YOUR CIVIC SERVICES, IN ONE PLACE':['ನಿಮ್ಮ ನಾಗರಿಕ ಸೇವೆಗಳು, ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ','आपकी नागरिक सेवाएँ, एक ही जगह'],
    'Government services,':['ಸರ್ಕಾರಿ ಸೇವೆಗಳು,','सरकारी सेवाएँ,'], 'made simpler.':['ಇನ್ನಷ್ಟು ಸರಳ.','और आसान।'],
    'Find the right service, understand what you need, and prepare your application with step-by-step guidance.':['ಸರಿಯಾದ ಸೇವೆಯನ್ನು ಹುಡುಕಿ, ಅಗತ್ಯಗಳನ್ನು ತಿಳಿದು ಹಂತ ಹಂತದ ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಅರ್ಜಿ ಸಿದ್ಧಪಡಿಸಿ.','सही सेवा खोजें, ज़रूरतें समझें और चरणबद्ध मार्गदर्शन से आवेदन तैयार करें।'],
    'Start an application':['ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ','आवेदन शुरू करें'], 'View my applications':['ನನ್ನ ಅರ್ಜಿಗಳನ್ನು ನೋಡಿ','मेरे आवेदन देखें'],
    'You review every detail before a demo submission':['ಡೆಮೊ ಸಲ್ಲಿಕೆಗೆ ಮೊದಲು ಪ್ರತಿಯೊಂದು ವಿವರವನ್ನು ಪರಿಶೀಲಿಸಿ','डेमो जमा करने से पहले हर विवरण जाँचें'],
    'ASSISTANT READY':['ಸಹಾಯಕ ಸಿದ್ಧ','सहायक तैयार'], 'A little guidance goes a long way.':['ಸ್ವಲ್ಪ ಮಾರ್ಗದರ್ಶನ ಬಹಳ ಸಹಾಯಕ.','थोड़ा मार्गदर्शन बहुत मददगार है।'],
    'Namaskara! What government service can I help you with today?':['ನಮಸ್ಕಾರ! ಇಂದು ಯಾವ ಸರ್ಕಾರಿ ಸೇವೆಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಲಿ?','नमस्कार! आज किस सरकारी सेवा में मदद करूँ?'],
    'Scholarships':['ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು','छात्रवृत्तियाँ'], 'Driving licence':['ಚಾಲನಾ ಪರವಾನಗಿ','ड्राइविंग लाइसेंस'], 'Subsidies':['ಸಬ್ಸಿಡಿಗಳು','सब्सिडी'],
    'Private session  demo environment':['ಖಾಸಗಿ ಸೆಷನ್ · ಡೆಮೊ ಪರಿಸರ','निजी सत्र · डेमो वातावरण'], 'START WITH WHAT YOU NEED':['ನಿಮಗೆ ಬೇಕಾದುದರಿಂದ ಪ್ರಾರಂಭಿಸಿ','अपनी ज़रूरत से शुरू करें'],
    'Services for everyday life':['ದೈನಂದಿನ ಜೀವನದ ಸೇವೆಗಳು','रोज़मर्रा की सेवाएँ'], 'Clear next steps, without the paperwork guesswork.':['ಕಾಗದಪತ್ರಗಳ ಗೊಂದಲವಿಲ್ಲದೆ ಮುಂದಿನ ಸ್ಪಷ್ಟ ಹಂತಗಳು.','कागज़ी उलझन के बिना अगले स्पष्ट कदम।'],
    'Scholarship assistance':['ವಿದ್ಯಾರ್ಥಿವೇತನ ಸಹಾಯ','छात्रवृत्ति सहायता'], 'Explore a guided scholarship application demo, eligibility checks and document checklist.':['ವಿದ್ಯಾರ್ಥಿವೇತನ ಅರ್ಜಿ ಡೆಮೊ, ಅರ್ಹತಾ ಪರಿಶೀಲನೆ ಮತ್ತು ದಾಖಲೆಗಳ ಪಟ್ಟಿಯನ್ನು ನೋಡಿ.','छात्रवृत्ति आवेदन डेमो, पात्रता जाँच और दस्तावेज़ सूची देखें।'],
    'Start scholarship application':['ವಿದ್ಯಾರ್ಥಿವೇತನ ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ','छात्रवृत्ति आवेदन शुरू करें'], 'Government subsidies':['ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿಗಳು','सरकारी सब्सिडी'],
    'Get a simple learner or permanent licence checklist and official starting point.':['ಕಲಿಕಾ ಅಥವಾ ಶಾಶ್ವತ ಪರವಾನಗಿಗೆ ಸರಳ ಪಟ್ಟಿ ಮತ್ತು ಅಧಿಕೃತ ಆರಂಭಿಕ ತಾಣ ಪಡೆಯಿರಿ.','लर्नर या स्थायी लाइसेंस की सूची और आधिकारिक शुरुआत देखें।'],
    'Find a starting point for subsidy support and a checklist of details to verify.':['ಸಬ್ಸಿಡಿ ಸಹಾಯಕ್ಕೆ ಆರಂಭಿಕ ಮಾಹಿತಿ ಮತ್ತು ಪರಿಶೀಲಿಸಬೇಕಾದ ವಿವರಗಳ ಪಟ್ಟಿ ಪಡೆಯಿರಿ.','सब्सिडी सहायता की शुरुआत और जाँचने योग्य विवरणों की सूची पाएँ।'],
    'View checklist':['ಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ','सूची देखें'], 'HOW IT WORKS':['ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ','यह कैसे काम करता है'],
    'From question to':['ಪ್ರಶ್ನೆಯಿಂದ','सवाल से'], 'ready-to-review draft.':['ಪರಿಶೀಲನೆಗೆ ಸಿದ್ಧ ಕರಡು.','समीक्षा के लिए तैयार मसौदा।'],
    'JanSeva AI helps organize the process. You stay in control at every step.':['JanSeva AI ಪ್ರಕ್ರಿಯೆಯನ್ನು ಸರಳಗೊಳಿಸುತ್ತದೆ. ಪ್ರತಿಯೊಂದು ಹಂತದಲ್ಲೂ ನಿಯಂತ್ರಣ ನಿಮ್ಮದೇ.','JanSeva AI प्रक्रिया व्यवस्थित करता है। हर कदम पर नियंत्रण आपका है।'],
    'Tell us what you need':['ನಿಮಗೆ ಬೇಕಾದುದನ್ನು ತಿಳಿಸಿ','हमें बताएँ कि आपको क्या चाहिए'], 'Describe your goal in a guided conversation.':['ಮಾರ್ಗದರ್ಶಿತ ಸಂಭಾಷಣೆಯಲ್ಲಿ ನಿಮ್ಮ ಉದ್ದೇಶ ತಿಳಿಸಿ.','निर्देशित बातचीत में अपना लक्ष्य बताएँ।'],
    'Check details and documents':['ವಿವರಗಳು ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ','विवरण और दस्तावेज़ जाँचें'], 'Review a transparent checklist and optional OCR text.':['ಸ್ಪಷ್ಟ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ ಮತ್ತು ಐಚ್ಛಿಕ OCR ಪಠ್ಯವನ್ನು ನೋಡಿ.','पारदर्शी सूची और वैकल्पिक OCR पाठ देखें।'],
    'Review before proceeding':['ಮುಂದುವರಿಯುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ','आगे बढ़ने से पहले समीक्षा करें'], 'Approve a simulated demo record and track its status.':['ಡೆಮೊ ದಾಖಲೆಯನ್ನು ಅನುಮೋದಿಸಿ ಅದರ ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.','डेमो रिकॉर्ड मंज़ूर करें और स्थिति देखें।'],
    'Useful guidance. You stay in charge.':['ಉಪಯುಕ್ತ ಮಾರ್ಗದರ್ಶನ. ನಿರ್ಧಾರ ನಿಮ್ಮದು.','उपयोगी मार्गदर्शन। नियंत्रण आपका।'],
    'Lets get started.':['ಪ್ರಾರಂಭಿಸೋಣ.','चलिए शुरू करें।'], 'Share only what is needed for this demo application. Use sample details if you prefer.':['ಈ ಡೆಮೊ ಅರ್ಜಿಗೆ ಅಗತ್ಯವಿರುವ ವಿವರಗಳನ್ನು ಮಾತ್ರ ಹಂಚಿಕೊಳ್ಳಿ. ಬೇಕಿದ್ದರೆ ಮಾದರಿ ವಿವರ ಬಳಸಿ.','इस डेमो आवेदन के लिए ज़रूरी जानकारी ही दें। चाहें तो नमूना विवरण दें।'],
    'Service assistant  English':['ಸೇವಾ ಸಹಾಯಕ  ಕನ್ನಡ / English','सेवा सहायक  हिन्दी / English'], 'Online':['ಆನ್‌ಲೈನ್','ऑनलाइन'],
    'Type your answer':['ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಬರೆಯಿರಿ','अपना उत्तर लिखें'], 'Send':['ಕಳುಹಿಸಿ','भेजें'], 'APPLICATION PROGRESS':['ಅರ್ಜಿ ಪ್ರಗತಿ','आवेदन की प्रगति'],
    'Applicant details':['ಅರ್ಜಿದಾರರ ವಿವರಗಳು','आवेदक का विवरण'], 'Eligibility & documents':['ಅರ್ಹತೆ ಮತ್ತು ದಾಖಲೆಗಳು','पात्रता और दस्तावेज़'], 'Review draft':['ಕರಡು ಪರಿಶೀಲನೆ','मसौदे की समीक्षा'],
    'Open application details':['ಅರ್ಜಿ ವಿವರಗಳನ್ನು ತೆರೆಯಿರಿ','आवेदन विवरण खोलें'], 'Demo privacy':['ಡೆಮೊ ಗೌಪ್ಯತೆ','डेमो गोपनीयता'],
    'Please use synthetic details and sample documents. Avoid Aadhaar, bank details or other sensitive information.':['ಕಲ್ಪಿತ ವಿವರಗಳು ಮತ್ತು ಮಾದರಿ ದಾಖಲೆಗಳನ್ನು ಬಳಸಿ. ಆಧಾರ್, ಬ್ಯಾಂಕ್ ಅಥವಾ ಸೂಕ್ಷ್ಮ ಮಾಹಿತಿ ನೀಡಬೇಡಿ.','काल्पनिक विवरण और नमूना दस्तावेज़ इस्तेमाल करें। आधार, बैंक या संवेदनशील जानकारी न दें।'],
    'Looking for something else?':['ಬೇರೆ ಏನಾದರೂ ಹುಡುಕುತ್ತಿದ್ದೀರಾ?','कुछ और खोज रहे हैं?'], 'See all services':['ಎಲ್ಲಾ ಸೇವೆಗಳನ್ನು ನೋಡಿ','सभी सेवाएँ देखें'],
    'YOUR JANSEVA SPACE':['ನಿಮ್ಮ ಜನಸೇವಾ ಸ್ಥಳ','आपका जनसेवा स्थान'], 'See your drafts and simulated demo submissions in one place.':['ನಿಮ್ಮ ಕರಡುಗಳು ಮತ್ತು ಡೆಮೊ ಸಲ್ಲಿಕೆಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ನೋಡಿ.','अपने मसौदे और डेमो आवेदन एक जगह देखें।'],
    'New application':['ಹೊಸ ಅರ್ಜಿ','नया आवेदन'], 'No applications yet':['ಇನ್ನೂ ಅರ್ಜಿಗಳಿಲ್ಲ','अभी कोई आवेदन नहीं'], 'Start with a guided scholarship assistance demo.':['ಮಾರ್ಗದರ್ಶಿತ ವಿದ್ಯಾರ್ಥಿವೇತನ ಡೆಮೊದಿಂದ ಪ್ರಾರಂಭಿಸಿ.','निर्देशित छात्रवृत्ति डेमो से शुरू करें।'],
    'SERVICE APPLICATION DEMO':['ಸೇವಾ ಅರ್ಜಿ ಡೆಮೊ','सेवा आवेदन डेमो'], 'What you will need':['ನಿಮಗೆ ಬೇಕಾಗುವವು','आपको क्या चाहिए'], 'BEFORE YOU BEGIN':['ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು','शुरू करने से पहले'],
    'Your name':['ನಿಮ್ಮ ಹೆಸರು','आपका नाम'], 'State or UT':['ರಾಜ್ಯ ಅಥವಾ ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶ','राज्य या केंद्रशासित प्रदेश'], 'Licence type':['ಪರವಾನಗಿ ವಿಧ','लाइसेंस का प्रकार'], 'Subsidy category':['ಸಬ್ಸಿಡಿ ವರ್ಗ','सब्सिडी श्रेणी'],
    'Choose one':['ಒಂದನ್ನು ಆಯ್ಕೆಮಾಡಿ','एक चुनें'], 'Learner licence':['ಕಲಿಕಾ ಪರವಾನಗಿ','लर्नर लाइसेंस'], 'Permanent driving licence':['ಶಾಶ್ವತ ಚಾಲನಾ ಪರವಾನಗಿ','स्थायी ड्राइविंग लाइसेंस'],
    'Create my checklist':['ನನ್ನ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ ರಚಿಸಿ','मेरी सूची बनाएँ'], 'Use a demo name':['ಡೆಮೊ ಹೆಸರನ್ನು ಬಳಸಿ','डेमो नाम इस्तेमाल करें'], 'For example, Karnataka':['ಉದಾಹರಣೆಗೆ, ಕರ್ನಾಟಕ','उदाहरण: कर्नाटक'],
    'APPLICATION DETAILS':['ಅರ್ಜಿ ವಿವರಗಳು','आवेदन विवरण'], 'Review your application':['ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಪರಿಶೀಲಿಸಿ','अपने आवेदन की समीक्षा करें'], 'APPLICANT PROFILE':['ಅರ್ಜಿದಾರರ ಪ್ರೊಫೈಲ್','आवेदक प्रोफ़ाइल'], 'Check your details':['ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ','अपना विवरण जाँचें'],
    'Full name':['ಪೂರ್ಣ ಹೆಸರು','पूरा नाम'], 'Service or category':['ಸೇವೆ ಅಥವಾ ವರ್ಗ','सेवा या श्रेणी'], 'State or UT':['ರಾಜ್ಯ ಅಥವಾ ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶ','राज्य या केंद्रशासित प्रदेश'],
    'YOUR PREPARATION CHECKLIST':['ನಿಮ್ಮ ಸಿದ್ಧತಾ ಪಟ್ಟಿ','आपकी तैयारी सूची'], 'YOUR PREPARATION CHECKLIST':['ನಿಮ್ಮ ಸಿದ್ಧತಾ ಪಟ್ಟಿ','आपकी तैयारी सूची'],
    'DOCUMENTS':['ದಾಖಲೆಗಳು','दस्तावेज़'], 'Optional supporting files':['ಐಚ್ಛಿಕ ಪೂರಕ ಕಡತಗಳು','वैकल्पिक सहायक फ़ाइलें'], 'Upload and inspect':['ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಪರಿಶೀಲಿಸಿ','अपलोड करें और जाँचें'], 'No files uploaded. Documents are optional in this demo.':['ಯಾವುದೇ ಕಡತ ಅಪ್‌ಲೋಡ್ ಆಗಿಲ್ಲ. ಈ ಡೆಮೊದಲ್ಲಿ ದಾಖಲೆಗಳು ಐಚ್ಛಿಕ.','कोई फ़ाइल अपलोड नहीं हुई। इस डेमो में दस्तावेज़ वैकल्पिक हैं।'],
    'NEXT STEP':['ಮುಂದಿನ ಹಂತ','अगला कदम'], 'Prepare a review draft':['ಪರಿಶೀಲನಾ ಕರಡು ಸಿದ್ಧಪಡಿಸಿ','समीक्षा मसौदा तैयार करें'], 'Prepare draft for review':['ಪರಿಶೀಲನೆಗೆ ಕರಡು ಸಿದ್ಧಪಡಿಸಿ','समीक्षा के लिए मसौदा बनाएँ'],
    'STATUS HISTORY':['ಸ್ಥಿತಿ ಇತಿಹಾಸ','स्थिति इतिहास'], 'Application journey':['ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆ','आवेदन यात्रा'], 'Your progress will appear here.':['ನಿಮ್ಮ ಪ್ರಗತಿ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.','आपकी प्रगति यहाँ दिखेगी।'],
    'Select language':['ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ','भाषा चुनें'], 'This creates a local demo application only. Check current requirements and apply using the':['ಇದು ಸ್ಥಳೀಯ ಡೆಮೊ ಅರ್ಜಿಯನ್ನು ಮಾತ್ರ ರಚಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ಅವಶ್ಯಕತೆ ಪರಿಶೀಲಿಸಿ, ಅಧಿಕೃತ ತಾಣದ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ:','यह केवल स्थानीय डेमो आवेदन बनाता है। मौजूदा ज़रूरतें जाँचें और आधिकारिक पोर्टल से आवेदन करें:']
    , 'What is your full name? Use a demo name if you prefer.':['ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಏನು? ಬೇಕಿದ್ದರೆ ಡೆಮೊ ಹೆಸರನ್ನು ಬಳಸಿ.','आपका पूरा नाम क्या है? चाहें तो डेमो नाम दें।']
    , 'What are you studying now? For example, 2nd PUC or undergraduate.':['ನೀವು ಈಗ ಏನು ಓದುತ್ತಿದ್ದೀರಿ? ಉದಾ: ದ್ವಿತೀಯ ಪಿಯುಸಿ ಅಥವಾ ಪದವಿ.','आप अभी क्या पढ़ रहे हैं? जैसे 12वीं या स्नातक।']
    , 'Which state are you applying from?':['ನೀವು ಯಾವ ರಾಜ್ಯದಿಂದ ಅರ್ಜಿ ಸಲ್ಲಿಸುತ್ತಿದ್ದೀರಿ?','आप किस राज्य से आवेदन कर रहे हैं?']
    , 'What is your approximate annual household income in rupees?':['ನಿಮ್ಮ ಕುಟುಂಬದ ಅಂದಾಜು ವಾರ್ಷಿಕ ಆದಾಯ ಎಷ್ಟು ರೂಪಾಯಿ?','आपके परिवार की अनुमानित वार्षिक आय कितनी रुपये है?']
    , 'Confirm which licence stage you need':['ಯಾವ ಹಂತದ ಪರವಾನಗಿ ಬೇಕು ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ','आपको लाइसेंस का कौन सा चरण चाहिए, पुष्टि करें']
    , 'Check the current official eligibility and age requirements':['ಪ್ರಸ್ತುತ ಅಧಿಕೃತ ಅರ್ಹತೆ ಮತ್ತು ವಯಸ್ಸಿನ ಅವಶ್ಯಕತೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ','मौजूदा आधिकारिक पात्रता और आयु आवश्यकताएँ जाँचें']
    , 'Prepare identity, address, age and medical documents as applicable':['ಅಗತ್ಯವಿದ್ದಲ್ಲಿ ಗುರುತು, ವಿಳಾಸ, ವಯಸ್ಸು ಮತ್ತು ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ','ज़रूरत अनुसार पहचान, पता, आयु और चिकित्सा दस्तावेज़ तैयार रखें']
    , 'Use the Parivahan portal for the official process':['ಅಧಿಕೃತ ಪ್ರಕ್ರಿಯೆಗೆ ಪರಿವಹನ್ ಪೋರ್ಟಲ್ ಬಳಸಿ','आधिकारिक प्रक्रिया के लिए परिवहन पोर्टल इस्तेमाल करें']
    , 'Identify the department and subsidy category':['ಇಲಾಖೆ ಮತ್ತು ಸಬ್ಸಿಡಿ ವರ್ಗವನ್ನು ಗುರುತಿಸಿ','विभाग और सब्सिडी श्रेणी पहचानें']
    , 'Check the current scheme notice and application window':['ಪ್ರಸ್ತುತ ಯೋಜನೆ ಪ್ರಕಟಣೆ ಮತ್ತು ಅರ್ಜಿ ಅವಧಿಯನ್ನು ಪರಿಶೀಲಿಸಿ','मौजूदा योजना सूचना और आवेदन अवधि जाँचें']
    , 'Review income, location and category rules with the department':['ಆದಾಯ, ಸ್ಥಳ ಮತ್ತು ವರ್ಗದ ನಿಯಮಗಳನ್ನು ಇಲಾಖೆಯೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ','आय, स्थान और श्रेणी के नियम विभाग से जाँचें']
    , 'Keep relevant proof and bank information ready for the official portal; do not enter sensitive data in this demo':['ಅಧಿಕೃತ ತಾಣಕ್ಕೆ ಅಗತ್ಯ ದಾಖಲೆ ಸಿದ್ಧವಿರಲಿ; ಈ ಡೆಮೊದಲ್ಲಿ ಸೂಕ್ಷ್ಮ ಮಾಹಿತಿ ನಮೂದಿಸಬೇಡಿ','आधिकारिक पोर्टल के लिए प्रमाण तैयार रखें; इस डेमो में संवेदनशील जानकारी न दें']
    , 'Government updates':['ಸರ್ಕಾರಿ ಅಪ್‌ಡೇಟ್‌ಗಳು','सरकारी अपडेट']
    , '< Back':['< ಹಿಂದೆ','< पीछे'], 'Forward >':['ಮುಂದೆ >','आगे >']
    , 'OFFICIAL PUBLIC RELEASES':['ಅಧಿಕೃತ ಸಾರ್ವಜನಿಕ ಪ್ರಕಟಣೆಗಳು','आधिकारिक सार्वजनिक घोषणाएँ']
    , 'Relevant public announcements for scholarships, driving licences, and subsidies.':['ವಿದ್ಯಾರ್ಥಿವೇತನ, ಚಾಲನಾ ಪರವಾನಗಿ ಮತ್ತು ಸಬ್ಸಿಡಿಗಳ ಕುರಿತು ಸಂಬಂಧಿತ ಸಾರ್ವಜನಿಕ ಪ್ರಕಟಣೆಗಳು.','छात्रवृत्ति, ड्राइविंग लाइसेंस और सब्सिडी से जुड़ी सार्वजनिक घोषणाएँ।']
    , 'Refresh updates':['ಅಪ್‌ಡೇಟ್‌ಗಳನ್ನು ಮರುಪಡೆಯಿರಿ','अपडेट ताज़ा करें'], 'Coverage note':['ಮಾಹಿತಿ ವ್ಯಾಪ್ತಿ','कवरेज सूचना']
    , 'MATCHED ANNOUNCEMENTS':['ಹೊಂದಾಣಿಕೆಯ ಪ್ರಕಟಣೆಗಳು','मिलती-जुलती घोषणाएँ'], 'Latest notices':['ಇತ್ತೀಚಿನ ಸೂಚನೆಗಳು','नवीनतम सूचनाएँ']
    , 'All topics':['ಎಲ್ಲಾ ವಿಷಯಗಳು','सभी विषय'], 'Show':['ತೋರಿಸಿ','दिखाएँ']
    , 'Read official release':['ಅಧಿಕೃತ ಪ್ರಕಟಣೆ ಓದಿ','आधिकारिक सूचना पढ़ें']
    , 'No matched releases are saved yet.':['ಹೊಂದಾಣಿಕೆಯ ಪ್ರಕಟಣೆಗಳು ಇನ್ನೂ ಉಳಿಸಿಲ್ಲ.','अभी कोई मिलती-जुलती सूचना सहेजी नहीं गई।']
    , 'Use Refresh updates to check PIB. You can also open the official notice portals above; not every department publishes an RSS/API feed.':['PIB ಪರಿಶೀಲಿಸಲು ಅಪ್‌ಡೇಟ್‌ಗಳನ್ನು ಮರುಪಡೆಯಿರಿ. ಮೇಲಿನ ಅಧಿಕೃತ ತಾಣಗಳನ್ನೂ ತೆರೆಯಬಹುದು; ಎಲ್ಲ ಇಲಾಖೆಗಳೂ RSS/API ಪ್ರಕಟಿಸುವುದಿಲ್ಲ.','PIB जाँचने के लिए अपडेट ताज़ा करें। ऊपर दिए आधिकारिक पोर्टल भी देखें; हर विभाग RSS/API फ़ीड नहीं देता।']
    , 'Go back':['ಹಿಂದೆ ಹೋಗಿ','पीछे जाएँ'], 'Go forward':['ಮುಂದೆ ಹೋಗಿ','आगे जाएँ']
    , 'Civic services, made clearer.':['ನಾಗರಿಕ ಸೇವೆಗಳು, ಇನ್ನಷ್ಟು ಸ್ಪಷ್ಟವಾಗಿ.','नागरिक सेवाएँ, अब और स्पष्ट।']
    , 'Hackathon demonstration  No real government submission':['ಹ್ಯಾಕಥಾನ್ ಡೆಮೊ · ನಿಜವಾದ ಸರ್ಕಾರಿ ಸಲ್ಲಿಕೆ ಇಲ್ಲ','हैकाथॉन डेमो · कोई वास्तविक सरकारी आवेदन नहीं']
  };
  const dict = Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, values[lang === 'kn' ? 0 : 1]]));
  function translate(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue.trim()) continue;
      let value = node.nodeValue;
      for (const [english, localized] of Object.entries(dict)) value = value.replace(english, localized);
      node.nodeValue = value;
    }
    root.querySelectorAll('input[placeholder], input[aria-label]').forEach(el => {
      for (const attr of ['placeholder', 'aria-label']) if (el.hasAttribute(attr) && dict[el.getAttribute(attr)]) el.setAttribute(attr, dict[el.getAttribute(attr)]);
    });
    root.querySelectorAll('option, button').forEach(el => { const s = el.textContent.trim(); if (dict[s]) el.textContent = dict[s]; });
  }
  translate(document.body);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE) translate(node); }))).observe(document.body, {childList:true, subtree:true});
})();
