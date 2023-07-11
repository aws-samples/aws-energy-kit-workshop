from __future__ import print_function
import time
import sys
import math
import qwiic_scmd

myMotor = qwiic_scmd.QwiicScmd()

def runExample():
	print("Motor Test.")
	R_MTR = 0
	L_MTR = 1
	FWD = 0
	BWD = 1

	if myMotor.connected == False:
		print("Motor Driver not connected. Check connections.", \
			file=sys.stderr)
		return
	myMotor.begin()
	print("Motor initialized.")
	time.sleep(.250)
	
	# Zero Motor Speeds
	myMotor.set_drive(0,0,0)
	myMotor.set_drive(1,0,0)
	
	myMotor.enable()
	print("Motor enabled")
	time.sleep(.250)


	while True:
		speed = 20
		for speed in range(20,255):
			print(speed)
			myMotor.set_drive(L_MTR,FWD,speed)
			time.sleep(.05)
		for speed in range(254,20, -1):
			print(speed)
			myMotor.set_drive(L_MTR,FWD,speed)
			time.sleep(.05)
   
def run_test():
	try:
		runExample()
	except (KeyboardInterrupt, SystemExit) as exErr:
		print("Ending example.")
		myMotor.disable()
		sys.exit(0)