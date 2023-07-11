from .utils import test_motors, test_scmd, test_sensors


def test_suite(message):
    """Tests all sensors and motors"""
    test_sensors.run_test()
    test_scmd.run_test()
    test_motors.run_test()
    return message