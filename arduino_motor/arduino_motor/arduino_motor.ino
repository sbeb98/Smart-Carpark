#define outPinPlus  7
#define outPinMinus  8

#define inPinMinus 3
#define inPinPlus 2
int delayTime = 3000;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

  pinMode(outPinPlus, OUTPUT);
  pinMode(outPinMinus, OUTPUT);

  pinMode(inPinPlus, INPUT_PULLUP);
  pinMode(inPinMinus, INPUT_PULLUP);

}

void loop() {
  //pause motor
  digitalWrite(outPinPlus, LOW);
  digitalWrite(outPinMinus, LOW);

  
  if(digitalRead(inPinPlus) == LOW)
    posMotor();
  if(digitalRead(inPinMinus) == LOW)
    negMotor();
  
 

}

void posMotor(){
  Serial.println("Moving Motor in Pos dir");
  //move in positive direction 
  digitalWrite(outPinPlus, HIGH);
  digitalWrite(outPinMinus, LOW);
  delay(delayTime);
  
}

void negMotor(){
  Serial.println("Moving Motor in Neg dir");
  //move in negative direction
  digitalWrite(outPinPlus, LOW);
  digitalWrite(outPinMinus, HIGH);
  delay(delayTime);
  
}