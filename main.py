import argparse
import json
import os
import time

from tweepy import OAuthHandler, API, NotFound


def get_auth(consumer_key: str = None, consumer_secret: str = None,
             access_token: str = None, access_token_secret: str = None) -> OAuthHandler:
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


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-a', '--access-token', type=argparse.FileType('r'))
    parser.add_argument('-c', '--consumer-key', type=argparse.FileType('r'))
    parser.add_argument('-s', '--sleep', type=float, default=0.1)
    parser.add_argument('-n', '--limit', type=int, default=-1,
                        help='Number of tweets to be deleted. limit=-1 means unlimited')
    args = parser.parse_args()

    consumer_key = {}
    if args.consumer_key:
        consumer_key = json.load(args.consumer_key)
    access_token = {}
    if args.access_token:
        access_token = json.load(args.access_token)
    auth = get_auth(consumer_key=consumer_key.get('consumer_key'),
                    consumer_secret=consumer_key.get('consumer_secret'),
                    access_token=access_token.get('access_token'),
                    access_token_secret=access_token.get('access_token_secret'))
    api = API(auth)

    done = set()
    if tweets := api.user_timeline():
        for i in tweets:
            if 0 <= args.limit <= len(done):
                break
            tweet_id = i.id
            if tweet_id in done:
                continue
            print(i.created_at, ':', i.text)
            try:
                api.destroy_status(tweet_id)
                done.add(tweet_id)
            except NotFound:
                done.add(tweet_id)
            except Exception as e:
                print(e)
            time.sleep(args.sleep)
    print(f'deleted: {len(done)}')


if __name__ == '__main__':
    main()
