#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebAppStack } from '../lib/webapp-stack';

const app = new cdk.App();
new WebAppStack(app, "WebAppStack", {
});
