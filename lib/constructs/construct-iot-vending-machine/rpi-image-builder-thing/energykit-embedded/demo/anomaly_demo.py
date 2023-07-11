import turbinemotorrun
import vibrationmotor
import ggadpubsub
import time
import random
import threading
import sensorconfig

simulation_series = ['turbine-telemetry-simulator-california-central-blue', 'turbine-telemetry-simulator-oregon-east-green', 'turbine-telemetry-simulator-kansas-central-red', 'turbine-telemetry-simulator-kansas-central-red', 'turbine-telemetry-simulator-oregon-east-green', 'turbine-telemetry-simulator-oregon-east-green', 'turbine-telemetry-simulator-kansas-central-red', 'turbine-telemetry-simulator-oregon-east-green', 'turbine-telemetry-simulator-oregon-east-green', 'turbine-telemetry-simulator-kansas-central-red']

def simulate_no_anomaly(throttle, duration_seconds):
    print(f'Simulated Scenario 1: Normal Turbine Operation\n')
    periodic_anomaly_count = random.randint(5,10)
    # start motor
    turbinemotorrun.turbine_motor_run(duration_seconds, throttle)
    # define anamoly
    time.sleep(duration_seconds)
    turbinemotorrun.turbine_motor_shutoff(0)
    print("!!!!!!!!!!!!!!!\nTurbine Simulation Stopped. Awaiting restart.\n\n")

def anomaly_detect_stop(throttle, duration_seconds):
    print(f'Simulated Scenario 2: Predictive maintenance with machine learning model deployed to AWS IoT Greengrass Core\n')
    print(f'Detecting anomaly for predictive maintenance')
    periodic_anomaly_count = random.randint(5,10)
    duration_seconds = duration_seconds/2
    turbinemotorrun.turbine_motor_run(duration_seconds, throttle)
    # define anamoly
    vibrationmotor.periodic_random(duration_seconds,periodic_anomaly_count)
    print("****************\nAnomaly predicted using machine learning model, schedule preventive maintenance\n****************\n\n")
    time.sleep(random.randint(5,10))
    turbinemotorrun.turbine_motor_shutoff(0)

def run_simulation(throttle,duration_seconds,total_simulation):
    simulation_count = 0
    for i in range(len(simulation_series)):
        print("\nRunning Simulation: From Edge to Insight\n")
        if simulation_series[i] == sensorconfig.thing_name:
            anomaly_detect_stop(throttle,duration_seconds)
        else:
            simulate_no_anomaly(throttle,duration_seconds)
        simulation_count += 1
        time.sleep(10)


t2 = threading.Thread(target= ggadpubsub.pub_sub)

t2.start()

t1 = threading.Thread(target = run_simulation, args=(0.5,60,20))

t1.start()

t1.join()
t2.join()
