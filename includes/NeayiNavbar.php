<?php
/*
 * Copyright (c) 2016 The MITRE Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

namespace MediaWiki\Extension\NeayiNavbar;

use MWNamespace;
use MediaWiki\MediaWikiServices;

class NeayiNavbar
{

	// NeayiNavbar singleton instance
	private static $instance = null;

	// cache to store User GUIDs and information
	private static $usersInfos = array();

	/**
	 * create a NeayiNavbar singleton instance
	 *
	 * @return NeayiNavbar a singleton NeayiNavbar instance
	 */
	public static function singleton(): self
	{
		if (self::$instance === null) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * initializes the display of comments
	 *
	 * @param OutputPage $output OutputPage object
	 */
	public function init($output)
	{
		$this->initJS($output);
	}


	/**
	 * initialize JavaScript
	 *
	 * @param OutputPage $output the OutputPage object
	 * @param Comment[] $comments array of comments on the current page
	 */
	private function initJS($output)
	{
		// determine if comments should be initially collapsed or expanded
		// if the namespace is a talk namespace, use state of its subject namespace
		$title = $output->getTitle();
		$namespace = $title->getNamespace();
		if ($title->isTalkPage()) {
			$namespace = MWNamespace::getSubject($namespace);
		}

		$navbarParams = [];

		$user = $output->getUser();
		if ($user->isAnon())
		{
			$navbarParams['wgUserIsAnon'] = true;
			$navbarParams['wgUserAvatarURL'] = '';
			$navbarParams['wgUserName'] = '';
			$navbarParams['wgInsightsRootURL'] = $GLOBALS['wgInsightsRootURL'];
			$navbarParams['wgUserGuid'] = '';
		}
		else
		{
			$navbarParams['wgUserIsAnon'] = false;
			$navbarParams['wgUserAvatarURL'] = $this->getAvatar($user);
			$navbarParams['wgUserName'] = $user->getRealName();
			$navbarParams['wgInsightsRootURL'] = $GLOBALS['wgInsightsRootURL'];
			$navbarParams['wgUserGuid'] = self::getNeayiGUID( $user );
		}

		$store = MediaWikiServices::getInstance()->getWatchedItemStore();
		$navbarParams['wgInitialWatchedCount'] = $store->countWatchers($title);

		$output->addJsConfigVars('NeayiNavbar', $navbarParams);
		$output->addModules('ext.NeayiNavbar');
	}

	/**
	 * @return string the URL of the avatar of the loggedIn user
	 */
	public function getAvatar($user) {
		$this->avatar = self::getAvatarFromInsight( $user );

		if ( $this->avatar === null ) {
			if ( class_exists( 'wAvatar' ) ) {
				// from Extension:SocialProfile
				$avatar = new \wAvatar( $user->getId(), 'l' );
				$this->avatar = $GLOBALS['wgUploadPath'] . '/avatars/' .
					$avatar->getAvatarImage();
			} else {
				$this->avatar = self::getAvatarFromUser( $user );
			}
		}

		if ( empty($this->avatar) && !empty($GLOBALS['wgInsightsRootURL']) )
			$this->avatar = $GLOBALS['wgInsightsRootURL'] . "api/user/avatar/unknown/100";

		return $this->avatar;
	}

	/**
	 * return the name of the file page containing the user's avatar
	 *
	 * @param User $user the user
	 * @return string URL of avatar
	 */
	public static function getAvatarFromInsight( $user ) {
		if ( empty($GLOBALS['wgInsightsRootURL']) )
			return null;

		$guid = self::getNeayiGUID( $user );

		if (empty($guid))
			return null;

		return $GLOBALS['wgInsightsRootURL'] . "api/user/avatar/$guid/100";
	}

	/** 
	 * Cache the GUIDs for Users
	 */
	private static function getNeayiGUID( $user )
	{
		if (!empty(self::$usersInfos[$user->mId]['guid']))
			return self::$usersInfos[$user->mId]['guid'];

		self::$usersInfos[$user->mId]['guid'] = '';

		$dbr = wfGetDB(DB_REPLICA);
		$result = $dbr->selectRow(
			'neayiauth_users',
			[
				'neayiauth_external_userid'
			],
			[
				'neayiauth_user' => $user->mId
			],
			__METHOD__
		);
		if ( $result )
			self::$usersInfos[$user->mId]['guid'] = (string)$result->neayiauth_external_userid;
			
		return self::$usersInfos[$user->mId]['guid'];
	}	
}
