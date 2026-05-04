import random
from sqlalchemy.orm import Session
from datetime import date
from . import models, auth

def populate_full_data(db: Session):
    """81 ili, hastaneleri, poliklinikleri ve doktorları veritabanına ekler."""
    
    if db.query(models.City).first() is not None:
        print("Veritabanı zaten dolu. Seeding atlanıyor.")
        return

    print("MHRS Pro veri popülasyonu başlatılıyor...")
    
    hashed_pass = auth.get_password_hash("123456")

    # 1. Test Kullanıcısı (Hasta) oluştur
    test_patient = models.User(
        name="Mustafa Test",
        tc_kimlik="00000000000",
        password_hash=hashed_pass,
        role="patient",
        blood_type="A+",
        weight=75,
        height=180,
        phone="0532 111 22 33",
        email="mhrs_test@mail.com"
    )
    db.add(test_patient)
    db.commit()
    db.refresh(test_patient)

    # 2. Örnek Raporlar ve Tahliller
    r1 = models.MedicalReport(
        patient_id=test_patient.id,
        doctor_id=1, # Geçici, sonra güncellenebilir
        title="Genel Sağlık Taraması",
        content="Hastanın yapılan genel muayenesinde herhangi bir patolojik bulguya rastlanmamıştır. Tansiyon normal seyretmektedir."
    )
    r2 = models.MedicalReport(
        patient_id=test_patient.id,
        doctor_id=2,
        title="Grip Şikayeti Kontrolü",
        content="Mevsimsel grip belirtileri gözlemlendi. İstirahat ve bol sıvı tüketimi önerildi."
    )
    t1 = models.TestResult(
        patient_id=test_patient.id,
        test_name="Hemogram (Tam Kan Sayımı)",
        result_value="14.5",
        unit="g/dL",
        reference_range="13.5 - 17.5"
    )
    t2 = models.TestResult(
        patient_id=test_patient.id,
        test_name="B12 Vitamini",
        result_value="350",
        unit="pg/mL",
        reference_range="200 - 900"
    )
    db.add_all([r1, r2, t1, t2])
    db.commit()

    # 3. 81 İl ve Hastaneler
    cities_list = [
        "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
        "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
        "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan",
        "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta",
        "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
        "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla",
        "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop",
        "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat",
        "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın",
        "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
    ]

    clinics_list = [
        "Göz Hastalıkları", "İç Hastalıkları (Dahiliye)", "Kardiyoloji", "Nöroloji", 
        "Kulak Burun Boğaz", "Ortopedi", "Genel Cerrahi", "Çocuk Sağlığı", "Kadın Doğum"
    ]

    first_names = ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Mustafa", "Can", "Zeynep", "Ali"]
    last_names = ["Kaya", "Demir", "Yılmaz", "Şahin", "Çelik", "Yıldız", "Arslan", "Polat"]

    for city_name in cities_list:
        city = models.City(name=city_name)
        db.add(city)
        db.flush()

        district = models.District(name=f"{city_name} Merkez", city_id=city.id)
        db.add(district)
        db.flush()

        hospital = models.Hospital(name=f"{city_name} Devlet Hastanesi", district_id=district.id)
        db.add(hospital)
        db.flush()

        for c_name in clinics_list:
            dept = models.Department(name=c_name, hospital_id=hospital.id)
            db.add(dept)
            db.flush()

            # Doktor ekle
            doc_name = f"Dr. {random.choice(first_names)} {random.choice(last_names)}"
            tc = f"{random.randint(100, 999)}{city.id:02d}{dept.id:02d}{random.randint(0, 99)}"
            doctor = models.User(
                name=doc_name,
                tc_kimlik=tc[:11].ljust(11, '0'),
                password_hash=hashed_pass,
                role="doctor",
                department_id=dept.id
            )
            db.add(doctor)

        # Commit her ilde bir
        db.commit()

    print("Veri popülasyonu tamamlandı.")
