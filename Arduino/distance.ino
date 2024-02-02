#include <LiquidCrystal.h>

/* constantes pour les broches */ const byte TRIGGER = 6; // broche TRIGGER
const byte ECHO = 7;                                      // broche ECHO/* Constantes pour le timeout /const unsigned long MEASURE_TIMEOUT = 25000UL; // 25ms = 8m à 340m/s/ Vitesse du son dans l'air en mm/us */
const float SOUND_SPEED = 340.0 / 1000;
const unsigned long MEASURE_TIMEOUT = 25000UL;
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
void setup()
{

    lcd.begin(16, 2);

    /*code pour module ultrason HCSR04 */

    Serial.begin(115200);
    /* ATTENTION SUR ECRAN SERIAL MONITOR , il faudra choisir 115200 baud dans menu deroulant */
    pinMode(8, OUTPUT); // LED ROUGE BUZZER
    digitalWrite(8, LOW);
    pinMode(9, OUTPUT); // LED VERTE
    digitalWrite(9, HIGH);
    pinMode(TRIGGER, OUTPUT);
    digitalWrite(TRIGGER, LOW);
    pinMode(ECHO, INPUT);
}
void loop()
{
    /* 1 envoie une impulsion HIGH de 10 us sur broche trigger */
    digitalWrite(TRIGGER, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIGGER, LOW);

    /* 2 Mesure le temps entre l'envoi de l'impulsion et son echo */
    long measure = pulseIn(ECHO, HIGH, MEASURE_TIMEOUT);

    /* 3 calcul la distance a partir du temps mesuré */

    float distance_mm = measure / 2.0 * SOUND_SPEED;

    Serial.println("Distance: ");
    Serial.print(distance_mm);
    Serial.print("mm (");
    Serial.print(distance_mm / 10.0, 2);
    Serial.print("cm, ");
    Serial.print(distance_mm / 1000.0, 2);
    Serial.println("m)");

    lcd.print(distance_mm / 10.0, 2);
    lcd.print("  CM");

    lcd.display();
    if (distance_mm > 600)
    {
        digitalWrite(8, LOW);
        digitalWrite(9, HIGH);
    }
    else if (distance_mm < 1)
    {
        digitalWrite(8, LOW);
        digitalWrite(9, LOW);
    }
    else
    {
        digitalWrite(8, HIGH);
        digitalWrite(9, LOW);
    }

    delay(1000);
    lcd.clear();
}