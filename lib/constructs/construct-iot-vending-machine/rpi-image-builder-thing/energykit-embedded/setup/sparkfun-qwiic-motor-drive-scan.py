import qwiic_i2c

connectedDevices = qwiic_i2c.i2cDriver.scan()
if myDeviceAddress in connectedDevices:
	with qwiic_i2c.getI2CDriver() as i2c:
		i2c.writeByte(myDeviceAddress, register, 0x3F)