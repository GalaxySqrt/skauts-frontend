import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { LanguageService } from '../../../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule, TranslateModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent {
  currentLang$;

  languages = [
    { code: 'pt', flag: 'assets/flags/br.svg', label: 'LANGUAGES.PT' },
    { code: 'en', flag: 'assets/flags/us.svg', label: 'LANGUAGES.EN' },
    { code: 'es', flag: 'assets/flags/es.svg', label: 'LANGUAGES.ES' }
  ];

  constructor(private languageService: LanguageService) {
    this.currentLang$ = this.languageService.currentLanguage$;
  }

  changeLanguage(lang: string) {
    this.languageService.setLanguage(lang);
  }

  getFlag(langCode: string | null): string {
    const lang = this.languages.find(l => l.code === langCode);
    return lang ? lang.flag : 'assets/flags/br.svg';
  }
}
