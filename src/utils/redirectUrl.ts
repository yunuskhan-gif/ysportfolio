import { CompanyFactory } from '@/config/companies';

export const getLoginRedirectUrl = (activeTheme?: string | null): string => {
  let redirectUrl = `${process.env.NEXT_PUBLIC_HOME_URL}/login`;
  let companyId: string | null = null;
  
  const theme = activeTheme || (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null) || 'default';
  
  const themeCompany = CompanyFactory.createCompany(theme);
  if (themeCompany && themeCompany.id !== 'default') {
    companyId = themeCompany.id;
  }
  
  if (!companyId && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const parts = hostname.split('.');
      if (parts.length > 2 && parts[0] !== 'www') {
        companyId = parts[0].toLowerCase();
      } else if (parts.length === 2 && hostname.endsWith('.localhost')) {
        companyId = parts[0].toLowerCase();
      }
    }
  }
  
  let validCompanyId: string | null = null;
  if (companyId && companyId !== 'default') {
    try {
      const tempCompany = CompanyFactory.createCompany(companyId);
      if (tempCompany && tempCompany.id !== 'default') {
        validCompanyId = tempCompany.id;
      }
    } catch (e) {
      console.error("Failed to validate company", e);
    }
  }

  if (validCompanyId) {
    try {
      const urlObj = new URL(redirectUrl);
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
        urlObj.hostname = `${validCompanyId}.localhost`;
      } else {
        // Handle www.tradylytics.in -> moneydial.tradylytics.in
        let hostnameWithoutWww = urlObj.hostname.startsWith('www.') 
          ? urlObj.hostname.substring(4) 
          : urlObj.hostname;

        const parts = hostnameWithoutWww.split('.');
        if (parts.length > 2) {
          // If it has a subdomain already (like 'beta.tradylytics.in'), replace it
          parts[0] = validCompanyId;
          urlObj.hostname = parts.join('.');
        } else {
          // No subdomain (like 'tradylytics.in'), prepend it
          urlObj.hostname = `${validCompanyId}.${hostnameWithoutWww}`;
        }
      }
      redirectUrl = urlObj.href;
    } catch (e) {
      console.error("Failed to construct theme-based redirect URL", e);
    }
  } else {
    try {
      const urlObj = new URL(redirectUrl);
      if (urlObj.hostname !== 'localhost' && urlObj.hostname !== '127.0.0.1' && !urlObj.hostname.endsWith('.localhost')) {
        const parts = urlObj.hostname.split('.');
        if (parts.length > 2) {
          parts[0] = 'www';
        } else {
          parts.unshift('www');
        }
        urlObj.hostname = parts.join('.');
      }
      redirectUrl = urlObj.href;
    } catch (e) {
      console.error("Failed to construct default redirect URL", e);
    }
  }

  return redirectUrl;
};
