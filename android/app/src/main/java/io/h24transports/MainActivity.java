package io.h24transports;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onResume() {
      super.onResume();
      WebView webView = getBridge().getWebView();
      WebSettings webSettings = webView.getSettings();
      webSettings.setLoadWithOverviewMode(true);
      webSettings.setUseWideViewPort(true);
    }

    @Override
    public void onNewIntent (Intent intent) {
      super.onNewIntent(intent);

      String action = intent.getAction();
      Uri data = intent.getData();

      if (data != null) {
        String url = data.toString();
        if (url != null) {
          if (url.contains("https://h24transports.com")) {
            WebView webView = getBridge().getWebView();

            String absoluteUrl = url.replace("https://h24transports.com", "");
            /*
            url = webView.getUrl().replaceFirst("^(https?://[^/]+).*$", "$1" + absoluteUrl);
             */
            webView.loadUrl("https://localhost" + absoluteUrl);
          }
        }
      }
    }
}
