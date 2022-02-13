import argparse
import json
import os
import time

from tweepy import OAuthHandler, API, NotFound

ssm = None


def get_secret_from_ssm() -> list[str]:
    import boto3

    global ssm
    if not ssm:
        ssm = boto3.client('ssm')

    ssm_key_consumer_key = os.environ['SSM_KEY_CONSUMER_KEY']
    ssm_key_consumer_secret = os.environ['SSM_KEY_CONSUMER_SECRET']
    ssm_key_access_token = os.environ['SSM_KEY_ACCESS_TOKEN']
    ssm_key_access_token_secret = os.environ['SSM_KEY_ACCESS_TOKEN_SECRET']
    res = ssm.get_parameters(
        Names=[
            ssm_key_consumer_key,
            ssm_key_consumer_secret,
            ssm_key_access_token,
            ssm_key_access_token_secret,
        ],
        WithDecryption=True,
    )
    res = {i['Name']: i['Value'] for i in res['Parameters']}
    return [
        res[ssm_key_consumer_key],
        res[ssm_key_consumer_secret],
        res[ssm_key_access_token],
        res[ssm_key_access_token_secret],
    ]


def get_auth(consumer_key: str = None, consumer_secret: str = None,
             access_token: str = None, access_token_secret: str = None,
             use_ssm: bool = False) -> OAuthHandler:
    if use_ssm:
        (consumer_key,
         consumer_secret,
         access_token,
         access_token_secret) = get_secret_from_ssm()

    if not consumer_key:
        consumer_key = os.getenv('CONSUMER_KEY')
        assert consumer_key, 'Missing consumer_key'
    if not consumer_secret:
        consumer_secret = os.getenv('CONSUMER_SECRET')
        assert consumer_secret, 'Missing consumer_secret'
    if not access_token:
        access_token = os.getenv('ACCESS_TOKEN')
        assert access_token, 'Missing access_token'
    if not access_token_secret:
        access_token_secret = os.getenv('ACCESS_TOKEN_SECRET')
        assert access_token_secret, 'Missing access_token_secret'

    auth = OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    return auth


def parse_args(args=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('-a', '--access-token', type=argparse.FileType('r'))
    parser.add_argument('-c', '--consumer-key', type=argparse.FileType('r'))
    parser.add_argument('-s', '--sleep', type=float, default=0.1)
    parser.add_argument('-n', '--limit', type=int, default=-1,
                        help='Number of tweets to be deleted. limit=-1 means unlimited')
    return parser.parse_args(args)


def main(args=parse_args(), use_ssm: bool = False):
    print(f'limit={args.limit}')
    consumer_key = {}
    if args.consumer_key:
        consumer_key = json.load(args.consumer_key)
    access_token = {}
    if args.access_token:
        access_token = json.load(args.access_token)
    auth = get_auth(consumer_key=consumer_key.get('consumer_key'),
                    consumer_secret=consumer_key.get('consumer_secret'),
                    access_token=access_token.get('access_token'),
                    access_token_secret=access_token.get('access_token_secret'),
                    use_ssm=use_ssm)
    api = API(auth)

    done = set()
    if tweets := api.user_timeline(count=args.limit):
        for i in tweets:
            if 0 <= args.limit <= len(done):
                break
            tweet_id = i.id
            if tweet_id in done:
                continue
            print(i.created_at, ':', i.id)
            try:
                api.destroy_status(tweet_id)
                done.add(tweet_id)
            except NotFound:
                done.add(tweet_id)
            except Exception as e:
                print(e)
            time.sleep(args.sleep)
    print(f'deleted={len(done)}')
    return len(done)


def handler(event, _context):
    args = None
    if event and event.get('limit'):
        args = ['--limit', str(event['limit'])]

    n = main(args=parse_args(args), use_ssm=True)
    return {
        'count': n,
    }


if __name__ == '__main__':
    main()
