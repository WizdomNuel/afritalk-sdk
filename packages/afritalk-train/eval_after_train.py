import os
import subprocess
import json

def run_eval(language='swahili'):
    # Run the JS eval CLI against local provider endpoint
    env = os.environ.copy()
    env['PROVIDER'] = 'afritalk-local'
    env['LOCAL_MODEL_URL'] = env.get('LOCAL_MODEL_URL', 'http://localhost:8000')
    cmd = ['node', '-r', 'ts-node/register', 'packages/afritalk-eval/src/cli.ts', language, 'afritalk-local']
    proc = subprocess.run(cmd, env=env, capture_output=True, text=True)
    if proc.returncode != 0:
        print('Eval failed:', proc.stderr)
        return None
    try:
        return json.loads(proc.stdout)
    except Exception:
        print('Could not parse eval output')
        return proc.stdout

if __name__ == '__main__':
    import sys
    lang = sys.argv[1] if len(sys.argv)>1 else 'swahili'
    print(run_eval(lang))
