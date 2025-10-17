# GardenWise
Capstone project: GardenWise

# front end requirements
```bash
cd frontend
npm install
npm run dev
```

```bash
# Run locally
cd frontend
npm run dev
```
# back end requirements
```bash
Must have some version of Python 3 
https://www.python.org/downloads/windows/ (windows download)
sudo apt install python3 (Linux download)

cd backend
python3 -m venv venv  # Create a virtual environment, prevents dependency and project conflicts
source venv/bin/activate (Linux/MacOS)
.\venv\Scripts\activate (Windows)
pip install -r requirements.txt (dependencies)
python manage.py migrate
python manage.py createsuperuser (for Django admin interface access. Pass will not display as a security measure, enter as normal)
python manage.py runserver (for Django development server)

To access the Django admin interface, go to http://127.0.0.1:8000/admin/ after user creation, and log in using the super user acc you just made
```
# Other dependencies
pip install djangorestframework
pip install django-cors-headers
pip install requests