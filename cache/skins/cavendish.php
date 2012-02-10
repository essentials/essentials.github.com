<?php
/**
 * Mozilla cavendish theme
 * Modified by DaSch for MW 1.16 and WeCoWi
 *
 * Loosely based on the cavendish style by Gabriel Wicke
 *
 * @todo document
 * @package MediaWiki
 * @subpackage Skins
 */


if( !defined( 'MEDIAWIKI' ) )
	die();

/** */
require_once('includes/SkinTemplate.php');

/**
 * Inherit main code from SkinTemplate, set the CSS and template filter.
 * @todo document
 * @package MediaWiki
 * @subpackage Skins
 */

/**
 * Inherit main code from SkinTemplate, set the CSS and template filter.
 * @todo document
 * @ingroup Skins
 */
class Skincavendish extends SkinTemplate {
    /** Using cavendish. */
    var $skinname = 'cavendish', $stylename = 'cavendish',
        $template = 'CavendishTemplate', $useHeadElement = true;

    function setupSkinUserCss( OutputPage $out ) {
        global $wgHandheldStyle, $wgStyleVersion, $wgJsMimeType, $wgStylePath;

        parent::setupSkinUserCss( $out );

        // Append to the default screen common & print styles...
        $out->addStyle( 'cavendish/main.css', 'screen' );
		$out->addStyle( 'cavendish/print.css', 'print' );
        if( $wgHandheldStyle ) {
            // Currently in testing... try 'chick/main.css'
            $out->addStyle( $wgHandheldStyle, 'handheld' );
        }

        $out->addStyle( 'cavendish/IE50Fixes.css', 'screen', 'lt IE 5.5000' );
        $out->addStyle( 'cavendish/IE55Fixes.css', 'screen', 'IE 5.5000' );
        $out->addStyle( 'cavendish/IE60Fixes.css', 'screen', 'IE 6' );
        $out->addStyle( 'cavendish/IE70Fixes.css', 'screen', 'IE 7' );

        $out->addStyle( 'cavendish/rtl.css', 'screen', '', 'rtl' );

        # FIXME: What is this?  Should it apply to all skins?
        $path = htmlspecialchars( $wgStylePath );
        $out->addScript( <<<HTML
<!--[if lt IE 7]><script type="$wgJsMimeType" src="$path/common/IEFixes.js?$wgStyleVersion"></script>
    <meta http-equiv="imagetoolbar" content="no" /><![endif]-->
HTML
        );
    }
}
	
class cavendishTemplate extends QuickTemplate {
	/**
	 * Template filter callback for cavendish skin.
	 * Takes an associative array of data set from a SkinTemplate-based
	 * class, and a wrapper for MediaWiki's localization database, and
	 * outputs a formatted page.
	 *
	 * @access private
	 */
	function execute() {
		global $wgRequest;
		$styleversion = '1.0.0';
		$this->skin = $skin = $this->data['skin'];
		$action = $wgRequest->getText( 'action' );

		// Suppress warnings to prevent notices about missing indexes in $this->data
		wfSuppressWarnings();
		
		$this->html( 'headelement' );
?>
<div id="internal"></div>
<!-- Skin-Version: <?php echo $styleversion ?>-->
<div id="globalWrapper">

	<div id="p-personal">
		<ul class="top-nav">
			<?php foreach($this->data['personal_urls'] as $key => $item) {?>
			
			<li id="<?php echo Sanitizer::escapeId( "pt-$key" ) ?>" class="<?php
					if ($item['active']) { ?>active<?php } ?> top-nav-element">
				<span class="top-nav-left">&nbsp;</span>
				<a class="top-nav-mid <?php echo htmlspecialchars($item['class']) ?>" 
				   href="<?php echo htmlspecialchars($item['href']) ?>">
				   <?php echo htmlspecialchars($item['text']) ?></a>	
				<span class="top-nav-right">&nbsp;</span>
				<?php
				} ?>
			</li>
		</ul>
	</div>

	<div id="header">
		<a name="top" id="contentTop"></a>
		<h6>
		<a
	    href="<?php echo htmlspecialchars($this->data['nav_urls']['mainpage']['href'])?>"
	    title="<?php $this->msg('mainpage') ?>"><?php $this->text('pagetitle') ?></a></h6>
		<ul>
    <?php        foreach($this->data['content_actions'] as $key => $tab) {
                    echo '
                 <li id="' . Sanitizer::escapeId( "ca-$key" ) . '"';
                    if( $tab['class'] ) {
                        echo ' class="'.htmlspecialchars($tab['class']).'"';
                    }
                    echo '><a href="'.htmlspecialchars($tab['href']).'"';
                    # We don't want to give the watch tab an accesskey if the
                    # page is being edited, because that conflicts with the
                    # accesskey on the watch checkbox.  We also don't want to
                    # give the edit tab an accesskey, because that's fairly su-
                    # perfluous and conflicts with an accesskey (Ctrl-E) often
                    # used for editing in Safari.
                     if( in_array( $action, array( 'edit', 'submit' ) )
                     && in_array( $key, array( 'edit', 'watch', 'unwatch' ))) {
                         echo $skin->tooltip( "ca-$key" );
                     } else {
                         echo $skin->tooltipAndAccesskey( "ca-$key" );
                     }
                     echo '>'.htmlspecialchars($tab['text']).'</a></li>';
                } ?>
            </ul>
		<form name="searchform" action="<?php $this->text('wgScript') ?>" id="searchform">
			<div>
			<label for="searchInput"><?php $this->msg('search') ?></label>
			<input type="hidden" name="title" value="<?php $this->text('searchtitle') ?>"/>
			<input id="searchInput" name="search" type="text"<?php echo $this->skin->tooltipAndAccesskey('search');
					if( isset( $this->data['search'] ) ) {
						?> value="<?php $this->text('search') ?>"<?php } ?> />
			<input type='submit' name="go" class="searchButton" id="searchGoButton"	value="<?php $this->msg('searcharticle') ?>"<?php echo $this->skin->tooltipAndAccesskey( 'search-go' ); ?> />&nbsp;
			<input type='submit' name="fulltext" class="searchButton" id="mw-searchButton" value="<?php $this->msg('searchbutton') ?>"<?php echo $this->skin->tooltipAndAccesskey( 'search-fulltext' ); ?> />
	       </div>
		</form>
	</div>

	<div id="mBody">
	
		<div id="side">
			<ul id="nav">
			<?php
		$sidebar = $this->data['sidebar'];
		if ( !isset( $sidebar['TOOLBOX'] ) ) $sidebar['TOOLBOX'] = true;
		if ( !isset( $sidebar['LANGUAGES'] ) ) $sidebar['LANGUAGES'] = true;
		foreach ($sidebar as $boxName => $cont) {
			if ( $boxName == 'TOOLBOX' ) {
				$this->toolbox();
			} elseif ( $boxName == 'LANGUAGES' ) {
				$this->languageBox();
			} else {
				$this->customBox( $boxName, $cont );
			}
		}
		?>
				
			</ul>
			
<script type="text/javascript"><!--
google_ad_client = "ca-pub-0790686144654653";
/* Ess Tall */
google_ad_slot = "4077481570";
google_ad_width = 160;
google_ad_height = 600;
//-->
</script>
<script type="text/javascript"
src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
</script>
		</div><!-- end of SIDE div -->
		<div id="column-content">
			<div id="content">
				<a id="top"></a>
	        	<?php if($this->data['sitenotice']) { ?><div id="siteNotice"><?php $this->html('sitenotice') ?></div><?php } ?>
	        	<h1 id="firstHeading" class="firstHeading"><?php $this->html('title') ?></h1>
				<div id="bodyContent">
		            <h3 id="siteSub"><?php $this->msg('tagline') ?></h3>
		            <div id="contentSub"><?php $this->html('subtitle') ?></div>
		            <?php if($this->data['undelete']) { ?><div id="contentSub2"><?php     $this->html('undelete') ?></div><?php } ?>
		            <?php if($this->data['newtalk'] ) { ?><div class="usermessage"><?php $this->html('newtalk')  ?></div><?php } ?>
		            <?php if($this->data['showjumplinks']) { ?><div id="jump-to-nav"><?php $this->msg('jumpto') ?> <a href="#column-one"><?php $this->msg('jumptonavigation') ?></a>, <a href="#searchInput"><?php $this->msg('jumptosearch') ?></a></div><?php } ?>
					<!-- start content -->
					<?php $this->html('bodytext') ?>
					<?php if($this->data['catlinks']) { $this->html('catlinks'); } ?>
					<!-- end content -->
					<?php if($this->data['dataAfterContent']) { $this->html ('dataAfterContent'); } ?>
				</div>
			</div><!-- end of MAINCONTENT div -->	
		</div>
	
	</div><!-- end of MBODY div -->
	<div class="visualClear"></div>
	<div id="footer"><table style="width:100%;text-align:center;"><tr><td rowspan="5" style="width:5%;text-align:center;vertical-align:top;padding-right:1em;white-space:nowrap">
		<?php if($this->data['copyrightico']) { ?><div id="f-copyrightico"><?php $this->html('copyrightico') ?></div><?php } ?></td>
		<td align="center">
<?php	// Generate additional footer links
		$footerlinks = array(
			'lastmod', 'viewcount', 'numberofwatchingusers', 'credits', 'copyright',
			'privacy', 'about', 'disclaimer', 'tagline',
		);
		$validFooterLinks = array();
		foreach( $footerlinks as $aLink ) {
			if( isset( $this->data[$aLink] ) && $this->data[$aLink] ) {
				$validFooterLinks[] = $aLink;
			}
		}
		if ( count( $validFooterLinks ) > 0 ) {
?>			<ul id="f-list">
<?php
			foreach( $validFooterLinks as $aLink ) {
				if( isset( $this->data[$aLink] ) && $this->data[$aLink] ) {
?>					<li id="f-<?php echo$aLink?>"><?php $this->html($aLink) ?></li>
<?php 			}
			}
		}
?></td>
<td rowspan="5" style="width:5%;text-align:center;vertical-align:top;padding-left:1em;white-space:nowrap"><?php if($this->data['poweredbyico']) { ?><div id="f-poweredbyico"><?php $this->html('poweredbyico') ?></div><?php } ?></td></tr>
<tr><td><div>Essentials is one of the most popular Bukkit server plugins, for use on Minecraft servers.<br>Essentials is used on a wide range of servers, from large dedicated services, to home hosted servers.</div></td></tr>
<tr>
	<td>
		Mozilla Cavendish Theme based on Cavendish style by Gabriel Wicke modified by <a href="http://www.dasch-tour.de" target="_blank">DaSch</a><br/>
		<a href="http://sourceforge.net/projects/wecowi/">Sourceforge Projectpage</a> &ndash; <a href="https://sourceforge.net/apps/trac/wecowi/wiki">Bug Reports</a> &ndash; Skin-Version: <?php echo $styleversion ?>
	</td>
</tr>
</table>
	</div><!-- end of the FOOTER div -->
</div><!-- end of the CONTAINER div -->
<!-- scripts and debugging information -->
<?php $this->html('bottomscripts'); /* JS call to runBodyOnloadHook */ ?>
<?php $this->html('reporttime') ?>
<?php if ( $this->data['debug'] ): ?>
<!-- Debug output:
<?php $this->text( 'debug' ); ?> 
-->
<?php endif; ?>

</body>
</html>
<?php
	}
/*************************************************************************************************/
	function toolbox() {
?>
	<li class="portlet" id="p-tb">
		<span><?php $this->msg('toolbox') ?></span>
			<ul class="pBody">
<?php
		if($this->data['notspecialpage']) { ?>
				<li id="t-whatlinkshere"><a href="<?php
				echo htmlspecialchars($this->data['nav_urls']['whatlinkshere']['href'])
				?>"<?php echo $this->skin->tooltipAndAccesskey('t-whatlinkshere') ?>><?php $this->msg('whatlinkshere') ?></a></li>
<?php
			if( $this->data['nav_urls']['recentchangeslinked'] ) { ?>
				<li id="t-recentchangeslinked"><a href="<?php
				echo htmlspecialchars($this->data['nav_urls']['recentchangeslinked']['href'])
				?>"<?php echo $this->skin->tooltipAndAccesskey('t-recentchangeslinked') ?>><?php $this->msg('recentchangeslinked') ?></a></li>
<?php 		}
		}
		if(isset($this->data['nav_urls']['trackbacklink'])) { ?>
			<li id="t-trackbacklink"><a href="<?php
				echo htmlspecialchars($this->data['nav_urls']['trackbacklink']['href'])
				?>"<?php echo $this->skin->tooltipAndAccesskey('t-trackbacklink') ?>><?php $this->msg('trackbacklink') ?></a></li>
<?php 	}
		if($this->data['feeds']) { ?>
			<li id="feedlinks"><?php foreach($this->data['feeds'] as $key => $feed) {
					?><a id="<?php echo Sanitizer::escapeId( "feed-$key" ) ?>" href="<?php
					echo htmlspecialchars($feed['href']) ?>" rel="alternate" type="application/<?php echo $key ?>+xml" class="feedlink"<?php echo $this->skin->tooltipAndAccesskey('feed-'.$key) ?>><?php echo htmlspecialchars($feed['text'])?></a>&nbsp;
					<?php } ?></li><?php
		}

		foreach( array('contributions', 'log', 'blockip', 'emailuser', 'upload', 'specialpages') as $special ) {

			if($this->data['nav_urls'][$special]) {
				?><li id="t-<?php echo $special ?>"><a href="<?php echo htmlspecialchars($this->data['nav_urls'][$special]['href'])
				?>"<?php echo $this->skin->tooltipAndAccesskey('t-'.$special) ?>><?php $this->msg($special) ?></a></li>
<?php		}
		}

		if(!empty($this->data['nav_urls']['print']['href'])) { ?>
				<li id="t-print"><a href="<?php echo htmlspecialchars($this->data['nav_urls']['print']['href'])
				?>" rel="alternate"<?php echo $this->skin->tooltipAndAccesskey('t-print') ?>><?php $this->msg('printableversion') ?></a></li><?php
		}

		if(!empty($this->data['nav_urls']['permalink']['href'])) { ?>
				<li id="t-permalink"><a href="<?php echo htmlspecialchars($this->data['nav_urls']['permalink']['href'])
				?>"<?php echo $this->skin->tooltipAndAccesskey('t-permalink') ?>><?php $this->msg('permalink') ?></a></li><?php
		} elseif ($this->data['nav_urls']['permalink']['href'] === '') { ?>
				<li id="t-ispermalink"<?php echo $this->skin->tooltip('t-ispermalink') ?>><?php $this->msg('permalink') ?></li><?php
		}

		wfRunHooks( 'MonoBookTemplateToolboxEnd', array( &$this ) );
		wfRunHooks( 'SkinTemplateToolboxEnd', array( &$this ) );
?>
			</ul>
	</li>
<?php
	}

	/*************************************************************************************************/
	function languageBox() {
		if( $this->data['language_urls'] ) {
?>
	<li id="p-lang" class="portlet">
		<span><?php $this->msg('otherlanguages') ?></span>
			<ul class="pBody">
<?php		foreach($this->data['language_urls'] as $langlink) { ?>
				<li class="<?php echo htmlspecialchars($langlink['class'])?>"><?php
				?><a href="<?php echo htmlspecialchars($langlink['href']) ?>"><?php echo $langlink['text'] ?></a></li>
<?php		} ?>
			</ul>
	</li>
<?php
		}
	}

	/*************************************************************************************************/
	function customBox( $bar, $cont ) {
?>
	<li class='generated-sidebar portlet' id='<?php echo Sanitizer::escapeId( "p-$bar" ) ?>'<?php echo $this->skin->tooltip('p-'.$bar) ?>>
		<span><?php $out = wfMsg( $bar ); if (wfEmptyMsg($bar, $out)) echo $bar; else echo $out; ?></span>
<?php   if ( is_array( $cont ) ) { ?>
			<ul class='pBody'>
<?php 			foreach($cont as $key => $val) { ?>
				<li id="<?php echo Sanitizer::escapeId($val['id']) ?>"<?php
					if ( $val['active'] ) { ?> class="active" <?php }
				?>><a href="<?php echo htmlspecialchars($val['href']) ?>"<?php echo $this->skin->tooltipAndAccesskey($val['id']) ?>><?php echo htmlspecialchars($val['text']) ?></a></li>
<?php			} ?>
			</ul>
<?php   } else {
			# allow raw HTML block to be defined by extensions
			print $cont;
		}
?>
	</li>
<?php
	}

} // end of class
