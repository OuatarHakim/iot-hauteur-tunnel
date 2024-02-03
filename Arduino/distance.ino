#include <LiquidCrystal.h>

const byte TRIGGER = 6;                        // Broche TRIGGER
const byte ECHO = 7;                           // Broche ECHO
const float SOUND_SPEED = 340.0 / 1000;        // Vitesse du son dans l'air en mm/us
const unsigned long MEASURE_TIMEOUT = 25000UL; // 25ms = 8m à 340m/s
const float MAX_ALLOWED_HEIGHT = 100.0;        // Hauteur maximale autorisée en mm
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup()
{
    lcd.begin(16, 2);

    Serial.begin(115200); // Vitesse de communication série

    pinMode(8, OUTPUT); // LED ROUGE
    digitalWrite(8, LOW);
    pinMode(9, OUTPUT); // LED VERTE
    digitalWrite(9, LOW);
    pinMode(TRIGGER, OUTPUT);
    digitalWrite(TRIGGER, LOW);
    pinMode(ECHO, INPUT);
}

void loop()
{
    digitalWrite(TRIGGER, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIGGER, LOW);

    long measure = pulseIn(ECHO, HIGH, MEASURE_TIMEOUT);
    float distance_mm = measure / 2.0 * SOUND_SPEED;

    // Filtrer les données pour envoyer uniquement dans une plage spécifique (par exemple, entre 100 et 500 mm)

    // Envoyer la distance via le port série
    Serial.println(distance_mm);

    lcd.print(distance_mm / 10.0, 2);
    lcd.print("  CM");

    lcd.display();

    // Vérifier la hauteur du véhicule et allumer la LED appropriée
    if (distance_mm == 0)
    {

        digitalWrite(8, LOW); // LED rouge éteinte
        digitalWrite(9, LOW); // LED verte éteinte
    }
    else if (distance_mm <= MAX_ALLOWED_HEIGHT)
    {
        // La hauteur du véhicule n'est pas autorisée
        digitalWrite(8, HIGH); // LED rouge allumée
        digitalWrite(9, LOW);  // LED verte éteinte
    }
    else
    {

        // La hauteur du véhicule est autorisée
        digitalWrite(8, LOW);  // LED rouge éteinte
        digitalWrite(9, HIGH); // LED verte allumée
    }

    // Ajouter un court délai pour éviter d'envoyer trop fréquemment
    delay(1000);
    lcd.clear();
}
